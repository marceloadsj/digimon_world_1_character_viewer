import { Struct, StructData } from "@binary-files/structjs";

import { IS_LITTLE_ENDIAN } from "../constants";
import { NODES, BABY_NODES } from "../data/nodes";

export interface NodeStructData extends StructData {
  objectIndex: number;
  nodeIndex: number;
}

const NodeStruct = new Struct(
  Struct.Int8("objectIndex"),
  Struct.Int8("nodeIndex"),
);

export function newNodeStructs(startOffset: number, numberOfNodes: number) {
  // For some baby digimons, the skeleton has its own array buffer on a separated file
  const isBabyDigimon = startOffset > NODES().byteLength;

  return NodeStruct.createArray<NodeStructData>(
    isBabyDigimon ? BABY_NODES() : NODES(),
    isBabyDigimon ? 0 : startOffset,
    numberOfNodes,
    IS_LITTLE_ENDIAN,
  );
}
