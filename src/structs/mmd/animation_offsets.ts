import { IS_LITTLE_ENDIAN } from "../../constants";

export function newAnimationOffsets(dataView: DataView, startOffset: number) {
  // The first offset points to the end of offsets + 1, so, it can be used to calculate the number of offsets
  const numberOfAnimationOffsets =
    dataView.getUint32(startOffset, IS_LITTLE_ENDIAN) / 4; // 4 is because each offset is composed of 4 bytes

  return Array(numberOfAnimationOffsets)
    .fill(null)
    .map((_, index) =>
      dataView.getUint32(startOffset + index * 4, IS_LITTLE_ENDIAN)
    );
}
