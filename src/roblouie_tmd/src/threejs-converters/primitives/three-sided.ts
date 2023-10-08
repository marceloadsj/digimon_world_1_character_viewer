import * as THREE from "three";
import { conversionUtil } from "../conversion-util";
import { NormalData } from "../../tmd/structs/normal.struct";
import { ThreeSidedFlatTexturedData } from "../../tmd/structs/primitives/three-sided.struct";

export const threeSided = {
  flatTexturedConverter: (
    vertices: Array<THREE.Vector3>,
    packetData: ThreeSidedFlatTexturedData,
    normals: Array<NormalData>,
  ) => {
    const normal0 = conversionUtil.getThreeJSNormalFromIndex(
      normals,
      packetData.normal0,
    );

    return {
      faceNormals: [normal0, normal0, normal0],

      points: [
        vertices[packetData.vertex0],
        vertices[packetData.vertex1],
        vertices[packetData.vertex2],
      ],
    };
  },
};
