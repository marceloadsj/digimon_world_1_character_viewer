import { newPostureStructs, PostureStructData } from "./posture_struct";

export interface Pose {
  numberOfSequences: number;
  hasScale: number;
  postureStructs: Array<PostureStructData>;
}

export function newPose(
  dataView: DataView,
  startOffset: number,
  numberOfPostureNodes: number
): Pose {
  const numberOfSequences = dataView.getUint8(startOffset);
  const hasScale = dataView.getUint8(startOffset + 1);

  const postureStructs = newPostureStructs(
    dataView.buffer,
    startOffset + 2,
    numberOfPostureNodes,
    hasScale == 128 // This byte will be zero for false, or 128 for true
  );

  return {
    numberOfSequences,
    hasScale,
    postureStructs,
  };
}
