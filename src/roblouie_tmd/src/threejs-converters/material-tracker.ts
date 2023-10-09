import * as THREE from "three";
import { Primitive } from "../tmd/primitive";
import { TIM } from "../tim/tim";

export class MaterialTracker {
  private materials: THREE.Material[];
  private texturePages: { bitsPerPixelToMaterialIndex: Map<number, number> }[];
  private nonTexturedIndex: number;

  constructor() {
    this.materials = [];
    this.texturePages = [];
    this.nonTexturedIndex = undefined as unknown as number;

    for (let i = 0; i < 32; i++) {
      this.texturePages.push({
        bitsPerPixelToMaterialIndex: new Map(),
      });
    }
  }

  get objectMaterials(): THREE.Material[] {
    return this.materials;
  }

  createMaterialFromTIMAndGetIndex(
    primitive: Primitive,
    tims: TIM[],
  ): [number, ImageData?] {
    let textureImageData: ImageData | undefined;

    if (primitive.isTextured && tims.length > 0) {
      if (
        !this.isTextureAlreadySet(
          primitive.texturePage!,
          primitive.textureBitsPerPixel!,
        )
      ) {
        textureImageData = this.getTextureFromTIMs(tims, primitive);
        this.setTexturedMaterial(primitive, textureImageData!);
      }
    } else {
      this.setNonTexturedMaterial(primitive);
    }

    return [this.getMaterialIndex(primitive), textureImageData];
  }

  private setNonTexturedMaterial(primitive: Primitive) {
    if (this.nonTexturedIndex === undefined) {
      this.nonTexturedIndex = this.materials.length;

      if (primitive.isLightCalculated) {
        this.materials.push(
          new THREE.MeshStandardMaterial({ vertexColors: true }),
        );
      } else {
        this.materials.push(
          new THREE.MeshBasicMaterial({ vertexColors: true }),
        );
      }
    }
  }

  private setTexturedMaterial(
    primitive: Primitive,
    textureImageData: ImageData,
  ) {
    if (
      this.texturePages[
        primitive.texturePage!
      ]?.bitsPerPixelToMaterialIndex.get(primitive.textureCLUTYPosition!) ===
      undefined
    ) {
      var texture = new THREE.DataTexture(
        textureImageData.data,
        textureImageData.width,
        textureImageData.height,
        THREE.RGBAFormat,
      );
      texture.needsUpdate = true;
      const nextMaterialIndex = this.materials.length;
      this.texturePages[primitive.texturePage!].bitsPerPixelToMaterialIndex.set(
        primitive.textureCLUTYPosition!,
        nextMaterialIndex,
      );

      let material: THREE.Material;
      if (primitive.isLightCalculated) {
        material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.3,
          opacity: primitive.isTranslucent ? 0.5 : 1,
          side: THREE.BackSide,
        });
      } else {
        material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.3,
          opacity: primitive.isTranslucent ? 0.5 : 1,
          side: THREE.BackSide,
        });
      }

      this.materials.push(material);
    }
  }

  private getTextureFromTIMs(
    tims: TIM[],
    primitive: Primitive,
  ): ImageData | undefined {
    const timToUse = tims.find(
      (tim) => tim.texturePage === primitive.texturePage,
    );
    const textureImageData = timToUse?.createImageData(
      primitive.textureCLUTXPosition,
      primitive.textureCLUTYPosition,
    );
    return textureImageData;
  }

  private getMaterialIndex(primitive: Primitive): number {
    if (primitive.isTextured) {
      return this.texturePages[
        primitive.texturePage!
      ].bitsPerPixelToMaterialIndex.get(primitive.textureCLUTYPosition!)!;
    } else {
      return this.nonTexturedIndex;
    }
  }

  private isTextureAlreadySet(texturePage: number, bitsPerPixel: number) {
    return (
      this.texturePages[texturePage]?.bitsPerPixelToMaterialIndex.get(
        bitsPerPixel,
      ) !== undefined
    );
  }
}
