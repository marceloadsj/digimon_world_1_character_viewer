import * as THREE from "three";
import { NoLightTexturedSolidData } from "../../../tmd/structs/primitives/three-sided/no-light-textured-solid.struct";

export const NoLightTexturedSolidConverter = (
  vertices: Array<THREE.Vector3>,
  packetData: NoLightTexturedSolidData,
) => {
  return {
    faceNormals: [null, null, null],

    points: [
      vertices[packetData.vertex0],
      vertices[packetData.vertex1],
      vertices[packetData.vertex2],
    ],
  };
};
