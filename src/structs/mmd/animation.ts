import { newPose, Pose } from "./animation/pose";
import { newSequences, Sequence } from "./animation/sequences";

export interface Animation {
  pose: Pose;
  sequences: Array<Sequence>;
}

export function newAnimation(
  dataView: DataView,
  startOffset: number,
  numberOfNodes: number
): Animation {
  // There is no posture for the root node, as it is responsible to phisically move the digimon around
  const numberOfPostureNodes = numberOfNodes - 1;

  const pose = newPose(dataView, startOffset, numberOfPostureNodes);

  const sequences = newSequences(
    dataView,
    startOffset + 2 + numberOfPostureNodes * pose.postureStructs[0].byteLength
  );

  return {
    pose,
    sequences,
  };
}
