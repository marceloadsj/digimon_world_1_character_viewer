import { IS_LITTLE_ENDIAN } from "../constants";
import { SKELETON_POINTERS } from "../data/skeleton_pointers";

export const FIRST_SKELETON_POINTER = 0x8c170;

let dataView: DataView | null = null;

export function newSkeletonPointer(index: number) {
  if (dataView === null) {
    dataView = new DataView(SKELETON_POINTERS());
  }

  return dataView.getUint32(index * 4, IS_LITTLE_ENDIAN);
}
