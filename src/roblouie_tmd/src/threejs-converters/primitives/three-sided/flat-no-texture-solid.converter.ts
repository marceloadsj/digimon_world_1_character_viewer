// import * as THREE from "three";

// import { conversionUtil } from "../../conversion-util";
// import { NormalData } from "../../../tmd/structs/normal.struct";
// import { ThreeSidedFlatNoTextureSolidData } from "../../../tmd/structs/primitives/three-sided.struct";

// export const FlatNoTextureSolidConverter = {
//   GetFace(
//     packetData: ThreeSidedFlatNoTextureSolidData,
//     normals: NormalData[],
//     materialIndex: number,
//   ) {
//     const normal = conversionUtil.getThreeJSNormalFromIndex(
//       normals,
//       packetData.normal0,
//     );
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
//       normal,
//       color,
//       materialIndex,
//     );
//   },
// };

export {};
