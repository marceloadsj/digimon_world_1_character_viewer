const SKELETON_POINTERS_POINTER = 0x12245e60;
const SKELETON_POINTERS_BYTE_LENGTH = 0x000002cf;

var skeletonPointers: ArrayBuffer | null = null;

export const SKELETON_POINTERS = () => {
  if (skeletonPointers == null) {
    skeletonPointers = window.value.slice(
      SKELETON_POINTERS_POINTER,
      SKELETON_POINTERS_POINTER + SKELETON_POINTERS_BYTE_LENGTH,
    );
  }

  return skeletonPointers;
};
