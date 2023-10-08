import { newAnimation } from "./animation";

export function newAnimations(
  dataView: DataView,
  startOffset: number,
  animationOffsets: Array<number>,
  numberOfNodes: number
) {
  return animationOffsets.map((animationOffset) => {
    // When pointer is zero, it means there is no animation of that type for that digimon
    if (animationOffset === 0) {
      return null;
    }

    return newAnimation(dataView, startOffset + animationOffset, numberOfNodes);
  });
}
