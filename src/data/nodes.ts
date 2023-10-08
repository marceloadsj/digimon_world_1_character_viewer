const NODES_POINTER = 0x12245170;
const NODES_BYTE_LENGTH = 0x00000cef;

var nodes: ArrayBuffer | null = null;

export const NODES = () => {
  if (nodes == null) {
    nodes = window.value.slice(
      NODES_POINTER,
      NODES_POINTER + NODES_BYTE_LENGTH,
    );
  }

  return nodes;
};

const BABY_NODES_POINTER = 0x1225cb2c;
const BABY_NODES_BYTE_LENGTH = 0x00000007;

var babyNodes: ArrayBuffer | null = null;

export const BABY_NODES = () => {
  if (babyNodes == null) {
    babyNodes = window.value.slice(
      BABY_NODES_POINTER,
      BABY_NODES_POINTER + BABY_NODES_BYTE_LENGTH,
    );
  }

  return babyNodes;
};
