import { IS_LITTLE_ENDIAN } from "../../../constants";
import { newKeyframe, Keyframe } from "./sequences/keyframe";

export type Sequence =
  | LoopStartSequence
  | LoopEndSequence
  | TextureSequence
  | AxisSequence;

export function newSequences(dataView: DataView, startOffset: number) {
  const sequences: Array<Sequence> = [];

  let index = 0;
  while (true) {
    const bits = dataView.getUint16(startOffset + index, IS_LITTLE_ENDIAN);
    index += 2;

    const opcode = (bits & 0b1111_000000000000) >>> 12;
    const sequenceIndex = bits & 0b0000_111111111111;

    if (opcode === 0) {
      const [axisSequence, axisIndex] = newAxisSequence(
        dataView,
        startOffset + index,
        opcode,
        sequenceIndex
      );
      index += axisIndex;

      sequences.push(axisSequence);
    } else if (opcode === 1) {
      sequences.push(newLoopStartSequence(opcode, sequenceIndex));
    } else if (opcode === 2) {
      const [loopEndSequence, loopEndIndex] = newLoopEndSequence(
        dataView,
        startOffset + index,
        opcode,
        sequenceIndex
      );
      index += loopEndIndex;

      sequences.push(loopEndSequence);
    } else if (opcode === 3) {
      const [textureSequence, textureIndex] = newTextureSequence(
        dataView,
        startOffset + index,
        opcode,
        sequenceIndex
      );
      index += textureIndex;

      sequences.push(textureSequence);
    } else if (opcode === 4) {
      // TODO: fix, play sound
      index += 2;
    }

    if (dataView.getUint16(startOffset + index) === 0) {
      break;
    }
  }

  return sequences;
}

export interface LoopStartSequence {
  opcode: 1;
  repetitions: number;
}

function newLoopStartSequence(
  opcode: 1,
  repetitions: number
): LoopStartSequence {
  return { opcode, repetitions };
}

export interface LoopEndSequence {
  opcode: 2;
  sequenceIndex: number;
  startSequenceIndex: number;
}

function newLoopEndSequence(
  dataView: DataView,
  startOffset: number,
  opcode: 2,
  sequenceIndex: number
): [LoopEndSequence, number] {
  let index = 0;

  const startSequenceIndex = dataView.getUint16(
    startOffset + index,
    IS_LITTLE_ENDIAN
  );
  index += 2;

  return [{ opcode, sequenceIndex, startSequenceIndex }, index];
}

interface TextureSequence {
  opcode: 3;
  sequenceIndex: number;
  width: number;
  height: number;
  srcX: number;
  srcY: number;
  destX: number;
  destY: number;
}

function newTextureSequence(
  dataView: DataView,
  startOffset: number,
  opcode: 3,
  sequenceIndex: number
): [TextureSequence, number] {
  let index = 0;

  const srcBits = dataView.getUint16(startOffset + index, IS_LITTLE_ENDIAN);
  index += 2;

  const srcY = srcBits & 0b00000000_11111111;
  let srcX = (srcBits & 0b1111111111_000000) >>> 6;
  srcX = srcX % 2 === 0 ? srcX : srcX - 1;

  const sizeBits = dataView.getUint16(startOffset + index, IS_LITTLE_ENDIAN);
  index += 2;

  const height = sizeBits & 0b0000000000_111111;
  const width = (sizeBits & 0b1111111111_000000) >>> 6;

  const destBits = dataView.getUint16(startOffset + index, IS_LITTLE_ENDIAN);
  index += 2;

  const destY = destBits & 0b00000000_11111111;
  let destX = (destBits & 0b1111111111_000000) >>> 6;
  destX = destX % 2 === 0 ? destX : destX - 1;

  return [
    { opcode, sequenceIndex, width, height, srcX, srcY, destX, destY },
    index,
  ];
}

interface AxisSequence {
  opcode: 0;
  sequenceIndex: number;
  keyframes: Array<Keyframe>;
}

function newAxisSequence(
  dataView: DataView,
  startOffset: number,
  opcode: 0,
  sequenceIndex: number
): [AxisSequence, number] {
  const keyframes: Array<Keyframe> = [];

  let index = 0;
  while (true) {
    const bits = dataView.getUint16(startOffset + index, IS_LITTLE_ENDIAN);

    // If MSB is not set, it is not a keyframe anymore
    if ((bits & 0b1_000000000000000) >>> 15 === 0) {
      break;
    }

    index += 2;

    const [keyframe, keyframeIndex] = newKeyframe(
      dataView,
      startOffset + index,
      bits
    );
    index += keyframeIndex;

    keyframes.push(keyframe);
  }

  return [
    {
      opcode,
      sequenceIndex,
      keyframes,
    },
    index,
  ];
}
