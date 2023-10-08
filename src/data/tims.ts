const ALLTIM_POINTER = 0x001db000;
const ALLTIM_BYTE_LENGTH = 0x00329fff;

var tims: ArrayBuffer | null = null;

export const ALLTIM = () => {
  if (tims == null) {
    tims = window.value.slice(
      ALLTIM_POINTER,
      ALLTIM_POINTER + ALLTIM_BYTE_LENGTH,
    );
  }

  return tims;
};
