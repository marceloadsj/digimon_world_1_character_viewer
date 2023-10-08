import { Struct, StructData } from "@binary-files/structjs";

import { IS_LITTLE_ENDIAN } from "../../../constants";

interface NonScalablePostureStructData extends StructData {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

const NonScalablePostureStruct = new Struct(
  Struct.Int16("rotationX"),
  Struct.Int16("rotationY"),
  Struct.Int16("rotationZ"),
  Struct.Int16("positionX"),
  Struct.Int16("positionY"),
  Struct.Int16("positionZ")
);

interface ScalablePostureStructData extends NonScalablePostureStructData {
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

const ScalablePostureStruct = new Struct(
  Struct.Int16("scaleX"),
  Struct.Int16("scaleY"),
  Struct.Int16("scaleZ"),
  ...NonScalablePostureStruct.properties
);

export type PostureStructData =
  | NonScalablePostureStructData
  | ScalablePostureStructData;

export function newPostureStructs(
  arrayBuffer: ArrayBuffer,
  startOffset: number,
  numberOfPostureNodes: number,
  hasScale: boolean
): Array<PostureStructData> {
  if (hasScale) {
    return ScalablePostureStruct.createArray<ScalablePostureStructData>(
      arrayBuffer,
      startOffset,
      numberOfPostureNodes,
      IS_LITTLE_ENDIAN
    );
  }

  return NonScalablePostureStruct.createArray<NonScalablePostureStructData>(
    arrayBuffer,
    startOffset,
    numberOfPostureNodes,
    IS_LITTLE_ENDIAN
  );
}
