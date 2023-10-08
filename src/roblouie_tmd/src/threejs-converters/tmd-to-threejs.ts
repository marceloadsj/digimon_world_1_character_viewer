import * as THREE from "three";
import { MaterialTracker } from "./material-tracker";
import { GouradTexturedConverter } from "./primitives/three-sided/gourad-textured.converter";
import { TMD, TMDObject } from "../tmd/tmd";
import { VRAM } from "../vram/vram";
import { Primitive } from "../tmd/primitive";
import { PrimitiveType } from "../tmd/primitive-type.enum";
import { TIM } from "../tim/tim";
import { NoLightTexturedSolidConverter } from "./primitives/three-sided/no-light-textured-solid.converter";
import FourSidedConverter from "./primitives/four-sided/four-sided.converter";
import { threeSided } from "./primitives/three-sided";

export class TMDToThreeJS {
  convertWithTMDAndTIM(tmd: TMD, tims: TIM[]): THREE.Mesh[] {
    const meshArray: THREE.Mesh[] = [];
    const materialTracker = new MaterialTracker();

    tmd.objects.forEach((object) => {
      const geometry = new THREE.BufferGeometry();

      const vertices: Array<THREE.Vector3> = object.vertices.map(
        (vertex) => new THREE.Vector3(vertex.x, vertex.y, vertex.z),
      );

      let index = 0;
      let allPoints: Array<THREE.Vector3> = [];
      let allNormals: Array<number | null> = [];
      let allUvs: Array<number> = [];

      object.primitives.forEach((primitive) => {
        const [materialIndex, textureImageData] =
          materialTracker.createMaterialFromTIMAndGetIndex(primitive, tims);

        const [points, normal, uv] = this.populateGeometry(
          primitive,
          vertices,
          object,
          textureImageData,
        );

        geometry.addGroup(index, points.length, materialIndex);

        index += points.length;
        allPoints = [...allPoints, ...points];
        allNormals = [...allNormals, ...normal];
        allUvs = [...allUvs, ...uv];
      });

      const normal = Float32Array.from(
        allNormals.map((normal) =>
          normal === null ? 0 : (normal / 4096) * -1,
        ),
      );
      geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3));

      const uv = Float32Array.from(allUvs);
      geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

      geometry.setFromPoints(allPoints);

      meshArray.push(new THREE.Mesh(geometry, materialTracker.objectMaterials));
    });

    return meshArray;
  }

  private populateGeometry(
    primitive: Primitive,
    vertices: Array<THREE.Vector3>,
    object: TMDObject,
    textureData?: ImageData,
  ) {
    switch (primitive.packetDataType) {
      case PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_SOLID:
        throw Error("Not implemented");

      case PrimitiveType.THREE_SIDED_GOURAD_NO_TEXTURE_SOLID:
        throw Error("Not implemented");

      case PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_GRADIENT:
        throw Error("Not implemented");

      case PrimitiveType.THREE_SIDED_FLAT_TEXTURE: {
        const { faceNormals, points } = threeSided.flatTexturedConverter(
          vertices,
          primitive.packetData,
          object.normals,
        );

        const normal = faceNormals
          .map((faceNormal) => [faceNormal?.x, faceNormal?.y, faceNormal?.z])
          .flat();

        const uv = this.getUVs(primitive, textureData)
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
      }

      case PrimitiveType.THREE_SIDED_GOURAD_TEXTURE: {
        const { faceNormals, points } = GouradTexturedConverter(
          vertices,
          primitive.packetData,
          object.normals,
        );

        const normal = faceNormals
          .map((faceNormal) => [faceNormal?.x, faceNormal?.y, faceNormal?.z])
          .flat();

        const uv = this.getUVs(primitive, textureData)
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
      }

      case PrimitiveType.THREE_SIDED_NO_LIGHT_NO_TEXTURE_SOLID:
        throw Error("Not implemented");

      case PrimitiveType.THREE_SIDED_NO_LIGHT_TEXTURE_SOLID: {
        const { faceNormals, points } = NoLightTexturedSolidConverter(
          vertices,
          primitive.packetData,
        );

        const normal = faceNormals.map(() => [null, null, null]).flat();

        const uv = this.getUVs(primitive, textureData)
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
      }

      case PrimitiveType.FOUR_SIDED_GOURAD_NO_TEXTURE_SOLID: {
        const { faceNormals, points } = FourSidedConverter.GouradNoTextureSolid(
          vertices,
          primitive.packetData,
          object.normals,
        );

        const normal = faceNormals
          .map((faceNormal) => [faceNormal?.x, faceNormal?.y, faceNormal?.z])
          .flat();

        const uv = [
          ...this.getUVs(primitive, textureData),
          ...this.getUVsForSecondHalfOfFourSided(primitive, textureData),
        ]
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
      }

      case PrimitiveType.FOUR_SIDED_FLAT_TEXTURE_NO_COLOR: {
        const { faceNormals, points } = FourSidedConverter.FlatTexturedNoColor(
          vertices,
          primitive.packetData,
          object.normals,
        );

        const normal = faceNormals
          .map((faceNormal) => [faceNormal?.x, faceNormal?.y, faceNormal?.z])
          .flat();

        const uv = [
          ...this.getUVs(primitive, textureData),
          ...this.getUVsForSecondHalfOfFourSided(primitive, textureData),
        ]
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
      }

      case PrimitiveType.FOUR_SIDED_GOURAD_TEXTURE: {
        const { faceNormals, points } = FourSidedConverter.GouradTexture(
          vertices,
          primitive.packetData,
          object.normals,
        );

        const normal = faceNormals
          .map((faceNormal) => [faceNormal?.x, faceNormal?.y, faceNormal?.z])
          .flat();

        const uv = [
          ...this.getUVs(primitive, textureData),
          ...this.getUVsForSecondHalfOfFourSided(primitive, textureData),
        ]
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
      }

      case PrimitiveType.FOUR_SIDED_NO_LIGHT_NO_TEXTURE_SOLID:
        throw Error("Not implemented");

      case PrimitiveType.FOUR_SIDED_NO_LIGHT_TEXTURED_SOLID:
        const { faceNormals, points } = FourSidedConverter.NoLightTexturedSolid(
          vertices,
          primitive.packetData,
        );

        const normal = faceNormals.map(() => [null, null, null]).flat();

        const uv = [
          ...this.getUVs(primitive, textureData),
          ...this.getUVsForSecondHalfOfFourSided(primitive, textureData),
        ]
          .map((currentUv) => [currentUv.x, currentUv.y])
          .flat();

        return [points, normal, uv] as const;
    }

    return [[], [], []] as const;
  }

  private getUVs(primitive: Primitive, textureData?: ImageData) {
    const { u0, v0, u1, v1, u2, v2 } = primitive.packetData;

    const width =
      textureData == undefined
        ? VRAM.ACCESSIBLE_TEXTURE_WIDTH
        : textureData.width;
    const height =
      textureData == undefined
        ? VRAM.ACCESSIBLE_TEXTURE_HEIGHT
        : textureData.height;

    const uv0 = new THREE.Vector2(u0 / width, v0 / height);
    const uv1 = new THREE.Vector2(u1 / width, v1 / height);
    const uv2 = new THREE.Vector2(u2 / width, v2 / height);
    return [uv0, uv1, uv2];
  }

  private getUVsForSecondHalfOfFourSided(
    primitive: Primitive,
    textureData?: ImageData,
  ) {
    const { u1, v1, u2, v2, u3, v3 } = primitive.packetData;

    const width =
      textureData == undefined
        ? VRAM.ACCESSIBLE_TEXTURE_WIDTH
        : textureData.width;
    const height =
      textureData == undefined
        ? VRAM.ACCESSIBLE_TEXTURE_HEIGHT
        : textureData.height;

    const uv1 = new THREE.Vector2(u1 / width, v1 / height);
    const uv2 = new THREE.Vector2(u2 / width, v2 / height);
    const uv3 = new THREE.Vector2(u3 / width, v3 / height);
    return [uv1, uv3, uv2];
  }

  // private convertLines(object: TMDObject): THREE.Line {
  //   const points: THREE.Vector3[] = [];
  //   object.primitives.forEach(primitive => {
  //     if (points.length === 0) {
  //       const vertex0 = object.vertices[primitive.packetData.vertex0];
  //       points.push(new THREE.Vector3(vertex0.x, vertex0.y, vertex0.z));
  //     }

  //     const vertex1 = object.vertices[primitive.packetData.vertex1];
  //     points.push(new THREE.Vector3(vertex1.x, vertex1.y, vertex1.z));
  //   });

  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);
  //   return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  // }
}
