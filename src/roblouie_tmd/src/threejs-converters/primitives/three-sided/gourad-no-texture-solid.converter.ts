// import * as THREE from "three";
// import { conversionUtil } from "../../conversion-util";
// import { NormalData } from "../../../tmd/structs/normal.struct";
// import { ThreeSidedGouradNoTextureSolidData } from "../../../tmd/structs/primitives/three-sided.struct";

// export const GouradNoTextureSolidConverter = {
//   GetFace(
//     packetData: ThreeSidedGouradNoTextureSolidData,
//     normals: NormalData[],
//     materialIndex: number,
//   ) {
//     const normal0 = conversionUtil.getThreeJSNormalFromIndex(
//       normals,
//       packetData.normal0,
//     );
//     const normal1 = conversionUtil.getThreeJSNormalFromIndex(
//       normals,
//       packetData.normal1,
//     );
//     const normal2 = conversionUtil.getThreeJSNormalFromIndex(
//       normals,
//       packetData.normal2,
//     );
//     const faceNormals = [normal0, normal1, normal2];

//     const rawColor = conversionUtil.combineRGBBytes(
//       packetData.red,
//       packetData.green,
//       packetData.blue,
//     );
//     const color = new THREE.Color(rawColor);

//     return new THREE.Face3(
//       packetData.vertex0,
//       packetData.vertex1,
//       packetData.vertex2,
//       faceNormals,
//       color,
//       materialIndex,
//     );
//   },
// };

export {};
