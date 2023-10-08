import { IS_LITTLE_ENDIAN } from "../../../../constants";

export const ANIMATION_PROPERTIES = ["scale", "position", "rotation"] as const;
export const ANIMATION_PROPERTY_AXIS = ["x", "y", "z"] as const;

export interface Keyframe {
  nodeIndex: number;
  hasScaleX: number;
  hasScaleY: number;
  hasScaleZ: number;
  hasRotationX: number;
  hasRotationY: number;
  hasRotationZ: number;
  hasPositionX: number;
  hasPositionY: number;
  hasPositionZ: number;
  duration: number;
  scaleX: number | null;
  scaleY: number | null;
  scaleZ: number | null;
  rotationX: number | null;
  rotationY: number | null;
  rotationZ: number | null;
  positionX: number | null;
  positionY: number | null;
  positionZ: number | null;
}

export function newKeyframe(
  dataView: DataView,
  startOffset: number,
  bits: number
): [Keyframe, number] {
  let index = 0;

  const nodeIndex = bits & 0b0_000_000_000_111111;

  const hasScaleX = (bits & 0b0_100_000_000_000000) >>> 14;
  const hasScaleY = (bits & 0b0_010_000_000_000000) >>> 13;
  const hasScaleZ = (bits & 0b0_001_000_000_000000) >>> 12;

  const hasRotationX = (bits & 0b0_000_100_000_000000) >>> 11;
  const hasRotationY = (bits & 0b0_000_010_000_000000) >>> 10;
  const hasRotationZ = (bits & 0b0_000_001_000_000000) >>> 9;

  const hasPositionX = (bits & 0b0_000_000_100_000000) >>> 8;
  const hasPositionY = (bits & 0b0_000_000_010_000000) >>> 7;
  const hasPositionZ = (bits & 0b0_000_000_001_000000) >>> 6;

  const duration = dataView.getUint16(startOffset + index, IS_LITTLE_ENDIAN);
  index += 2;

  const [
    scaleX,
    scaleY,
    scaleZ,
    rotationX,
    rotationY,
    rotationZ,
    positionX,
    positionY,
    positionZ,
  ] = [
    hasScaleX,
    hasScaleY,
    hasScaleZ,
    hasRotationX,
    hasRotationY,
    hasRotationZ,
    hasPositionX,
    hasPositionY,
    hasPositionZ,
  ].map((hasAxis) => {
    if (hasAxis) {
      const axis = dataView.getInt16(startOffset + index, IS_LITTLE_ENDIAN);
      index += 2;

      return axis;
    }

    return null;
  });

  return [
    {
      nodeIndex,
      hasScaleX,
      hasScaleY,
      hasScaleZ,
      hasRotationX,
      hasRotationY,
      hasRotationZ,
      hasPositionX,
      hasPositionY,
      hasPositionZ,
      duration,
      scaleX,
      scaleY,
      scaleZ,
      rotationX,
      rotationY,
      rotationZ,
      positionX,
      positionY,
      positionZ,
    },
    index,
  ];
}
