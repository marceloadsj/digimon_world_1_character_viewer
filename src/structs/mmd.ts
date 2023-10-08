import { TMD } from "../roblouie_tmd/src/tmd/tmd";

import { IS_LITTLE_ENDIAN } from "../constants";
import { MMDS } from "../data/mmds";
import { newAnimationOffsets } from "./mmd/animation_offsets";
import { newAnimations } from "./mmd/animations";
import { Animation } from "./mmd/animation";

export interface Mmd {
  tmdPointer: number;
  animationOffsetsPointer: number;

  tmd: TMD;

  animationOffsets: Array<number>;
  animations: Array<Animation | null>;
}

export function newMmd(index: number, numberOfNodes: number): Mmd {
  const arrayBuffer = MMDS(index);
  if (!arrayBuffer) {
    throw Error(`MMD with index ${index} does not exist`);
  }

  // Here we create the dynamic mmd struct property by property
  const dataView = new DataView(arrayBuffer);

  const tmdPointer = dataView.getUint32(0, IS_LITTLE_ENDIAN);
  const animationOffsetsPointer = dataView.getUint32(4, IS_LITTLE_ENDIAN);

  const tmd = new TMD(arrayBuffer, tmdPointer);

  const animationOffsets = newAnimationOffsets(
    dataView,
    animationOffsetsPointer,
  );

  const animations = newAnimations(
    dataView,
    animationOffsetsPointer,
    animationOffsets,
    numberOfNodes,
  );

  return {
    tmdPointer,
    animationOffsetsPointer,

    tmd,

    animationOffsets,
    animations,
  };
}
