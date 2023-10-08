import * as THREE from "three";
import { conversionUtil } from "../../conversion-util";
import { GouradTexturedData } from "../../../tmd/structs/primitives/three-sided/gourad-textured";
import { NormalData } from "../../../tmd/structs/normal.struct";

export const GouradTexturedConverter = (
  vertices: Array<THREE.Vector3>,
  packetData: GouradTexturedData,
  normals: NormalData[],
) => {
  const normal0 = conversionUtil.getThreeJSNormalFromIndex(
    normals,
    packetData.normal0,
  );
  const normal1 = conversionUtil.getThreeJSNormalFromIndex(
    normals,
    packetData.normal1,
  );
  const normal2 = conversionUtil.getThreeJSNormalFromIndex(
    normals,
    packetData.normal2,
  );

  return {
    faceNormals: [normal0, normal1, normal2],

    points: [
      vertices[packetData.vertex0],
      vertices[packetData.vertex1],
      vertices[packetData.vertex2],
    ],
  };
};
