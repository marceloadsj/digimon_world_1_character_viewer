// Values to help reading the digimons table which contain their name and other infos
const DIGIMONS_POINTER = 0x12255eb4;
const DIGIMONS_BYTE_LENGTH = 0x248f;

var digimons: ArrayBuffer | null = null;

export const DIGIMONS = () => {
  if (digimons == null) {
    digimons = window.value.slice(
      DIGIMONS_POINTER,
      DIGIMONS_POINTER + DIGIMONS_BYTE_LENGTH + 1,
    );
  }

  return digimons;
};
