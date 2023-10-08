import * as THREE from "three";
import { conversionUtil } from "../../conversion-util";
import { NormalData } from "../../../tmd/structs/normal.struct";
import {
  FourSidedFlatTexturedNoColorData,
  FourSidedGouradNoTextureSolidData,
  FourSidedGouradTexturedData,
  FourSidedNoLightTexturedSolidData,
} from "../../../tmd/structs/primitives/four-sided.struct";

export default class FourSidedConverter {
  static GouradNoTextureSolid(
    vertices: Array<THREE.Vector3>,
    packetData: FourSidedGouradNoTextureSolidData,
    normals: Array<NormalData>,
  ) {
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
    const normal3 = conversionUtil.getThreeJSNormalFromIndex(
      normals,
      packetData.normal3,
    );

    return {
      faceNormals: [normal0, normal1, normal2, normal1, normal3, normal2],

      points: [
        vertices[packetData.vertex0],
        vertices[packetData.vertex1],
        vertices[packetData.vertex2],

        vertices[packetData.vertex1],
        vertices[packetData.vertex3],
        vertices[packetData.vertex2],
      ],
    };
  }

  static NoLightTexturedSolid(
    vertices: Array<THREE.Vector3>,
    packetData: FourSidedNoLightTexturedSolidData,
  ) {
    return {
      faceNormals: [null, null, null, null, null, null],

      points: [
        vertices[packetData.vertex0],
        vertices[packetData.vertex1],
        vertices[packetData.vertex2],

        vertices[packetData.vertex1],
        vertices[packetData.vertex3],
        vertices[packetData.vertex2],
      ],
    };
  }

  static FlatTexturedNoColor(
    vertices: Array<THREE.Vector3>,
    packetData: FourSidedFlatTexturedNoColorData,
    normals: Array<NormalData>,
  ) {
    const normal0 = conversionUtil.getThreeJSNormalFromIndex(
      normals,
      packetData.normal0,
    );

    return {
      faceNormals: [normal0, normal0, normal0, normal0, normal0, normal0],

      points: [
        vertices[packetData.vertex0],
        vertices[packetData.vertex1],
        vertices[packetData.vertex2],

        vertices[packetData.vertex1],
        vertices[packetData.vertex3],
        vertices[packetData.vertex2],
      ],
    };
  }

  // static NoLightNoTextureSolid(
  //   packetData: FourSidedNoLightNoTextureSolidData,
  //   materialIndex: number,
  // ) {
  //   const rawColor = conversionUtil.combineRGBBytes(
  //     packetData.red,
  //     packetData.green,
  //     packetData.blue,
  //   );
  //   const color = new THREE.Color(rawColor);
  //   // const face1 = new Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, undefined, color, materialIndex);
  //   // const face2 = new Face3(packetData.vertex1, packetData.vertex3, packetData.vertex2, undefined, color, materialIndex);
  //   // return [face1, face2];

  //   return [];
  // }

  static GouradTexture(
    vertices: Array<THREE.Vector3>,
    packetData: FourSidedGouradTexturedData,
    normals: Array<NormalData>,
  ) {
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
    const normal3 = conversionUtil.getThreeJSNormalFromIndex(
      normals,
      packetData.normal3,
    );

    return {
      faceNormals: [normal0, normal1, normal2, normal1, normal3, normal2],

      points: [
        vertices[packetData.vertex0],
        vertices[packetData.vertex1],
        vertices[packetData.vertex2],

        vertices[packetData.vertex1],
        vertices[packetData.vertex3],
        vertices[packetData.vertex2],
      ],
    };
  }
}
