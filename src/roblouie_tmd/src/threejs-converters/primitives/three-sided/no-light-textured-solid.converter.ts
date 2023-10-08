import * as THREE from "three";
import { ThreeSidedNoLightTexturedSolidData } from "../../../tmd/structs/primitives/three-sided.struct";

export const NoLightTexturedSolidConverter = (
  vertices: Array<THREE.Vector3>,
  packetData: ThreeSidedNoLightTexturedSolidData,
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
