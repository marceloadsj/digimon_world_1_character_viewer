import { PrimitiveData } from "./structs/primitive.struct";
import { PrimitiveType } from "./primitive-type.enum";
import {
  ThreeSidedFlatNoTextureGradientData,
  ThreeSidedFlatNoTextureSolidData,
  ThreeSidedFlatTexturedData,
  ThreeSidedGouradNoTextureSolidData,
  ThreeSidedGouradTexturedData,
  ThreeSidedNoLightNoTextureSolidData,
  ThreeSidedNoLightTexturedSolidData,
  threeSidedFlatNoTextureGradientStruct,
  threeSidedFlatNoTextureSolidStruct,
  threeSidedFlatTexturedStruct,
  threeSidedGouradNoTextureSolidStruct,
  threeSidedGouradTexturedStruct,
  threeSidedNoLightNoTextureSolidStruct,
  threeSidedNoLightTexturedSolidStruct,
} from "./structs/primitives/three-sided.struct";
import {
  LineGradientData,
  LineSolidData,
  lineGradientStruct,
  lineSolidStruct,
} from "./structs/primitives/line.struct";
import {
  FourSidedFlatTexturedNoColorData,
  FourSidedGouradNoTextureSolidData,
  FourSidedGouradTexturedData,
  FourSidedNoLightNoTextureSolidData,
  FourSidedNoLightTexturedSolidData,
  fourSidedFlatTexturedNoColorStruct,
  fourSidedGouradNoTextureSolidStruct,
  fourSidedGouradTexturedStruct,
  fourSidedNoLightNoTextureSolidStruct,
  fourSidedNoLightTexturedSolidStruct,
} from "./structs/primitives/four-sided.struct";

export class Primitive {
  constructor(arrayBuffer: ArrayBuffer, primitiveData: PrimitiveData) {
    this.primitiveData = primitiveData;

    // convert word length to byte length to store packet data length in bytes
    this.packetDataLength = primitiveData.ilen * 4;

    // total byte length of primitive with packet data
    this.totalByteLength = primitiveData.byteLength + this.packetDataLength;

    // Parse flag info
    const lightCalculationFlagBitmask = 0b00000001;
    const polygonFaceCountFlagBitmask = 0b00000010;
    const polygonColorFlagBitmask = 0b00000100;

    this.isLightCalculated =
      (primitiveData.flag & lightCalculationFlagBitmask) === 0;
    this.faces = ((primitiveData.flag & polygonFaceCountFlagBitmask) >> 1) + 1;
    this.colorMode =
      (primitiveData.flag & polygonColorFlagBitmask) >> 2 === 1
        ? "Gradient"
        : "Solid";

    // Parse code info
    const codeBitmask = 0b11100000;
    const undocumentedPolygonCode = 0;
    const polygonCode = 0b001;
    const lineCode = 0b010;
    const spriteCode = 0b011;
    const code = (primitiveData.mode & codeBitmask) >> 5;

    if (code === polygonCode || code === undocumentedPolygonCode) {
      this.codeType = "Polygon";
    } else if (code === lineCode) {
      this.codeType = "Line";
    } else if (code === spriteCode) {
      this.codeType = "Sprite";
    } else {
      this.codeType = "Unknown";
    }

    // Parse option Info
    const optionBitmask = 0b00011111;
    const isLightCalculatedAtTextureFlagBitmask = 0b00000001;
    const isTranslucenctFlagBitmask = 0b00000010;
    const isTexturedFlagBitmask = 0b00000100;
    const isFourSidedPolygonFlagBitmask = 0b00001000;
    const isGouradShadedFlagBitmask = 0b00010000;
    const option = primitiveData.mode & optionBitmask;

    this.isLightCalculatedAtTexture =
      (option & isLightCalculatedAtTextureFlagBitmask) === 1;
    this.isTranslucent = (option & isTranslucenctFlagBitmask) >> 1 === 1;
    this.isTextured = (option & isTexturedFlagBitmask) >> 2 === 1;
    this.numberOfSides =
      (option & isFourSidedPolygonFlagBitmask) >> 3 === 1 ? 4 : 3;
    this.shading =
      (option & isGouradShadedFlagBitmask) >> 4 === 1 ? "Gourad" : "Flat";

    this.packetDataType = "";
    this.setPacketData(arrayBuffer);
  }

  primitiveData: PrimitiveData;
  packetDataLength: number;
  totalByteLength: number;

  isLightCalculated: boolean;
  faces: number;
  colorMode: "Solid" | "Gradient";
  codeType: "Polygon" | "Line" | "Sprite" | "Unknown";

  isLightCalculatedAtTexture: boolean;
  isTranslucent: boolean;
  isTextured: boolean;
  numberOfSides: number;
  shading: string;

  packetData: any;
  packetDataType: PrimitiveType | string;

  private setPacketData(arrayBuffer: ArrayBuffer) {
    if (this.codeType === "Polygon") {
      this.setPolygon(arrayBuffer);
    } else if (this.codeType === "Line") {
      this.setLine(arrayBuffer);
    } else if (this.codeType === "Sprite") {
      throw Error("Not implemented");
    }
  }

  private setPolygon(arrayBuffer: ArrayBuffer) {
    if (this.numberOfSides === 3) {
      if (this.isLightCalculated) {
        this.setThreeSidedPolygonWithLight(arrayBuffer);
      } else {
        this.setThreeSidedPolygonWithoutLight(arrayBuffer);
      }
    } else if (this.numberOfSides === 4) {
      if (this.isLightCalculated) {
        this.setFourSidedPolygonWithLight(arrayBuffer);
      } else {
        this.setFourSidedPolygonWithoutLight(arrayBuffer);
      }
    }
  }

  private setThreeSidedPolygonWithLight(arrayBuffer: ArrayBuffer) {
    if (
      this.shading === "Flat" &&
      !this.isTextured &&
      this.colorMode === "Solid"
    ) {
      this.packetDataType = PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_SOLID;

      this.packetData =
        threeSidedFlatNoTextureSolidStruct.createObject<ThreeSidedFlatNoTextureSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (
      this.shading === "Gourad" &&
      !this.isTextured &&
      this.colorMode === "Solid"
    ) {
      this.packetDataType = PrimitiveType.THREE_SIDED_GOURAD_NO_TEXTURE_SOLID;

      this.packetData =
        threeSidedGouradNoTextureSolidStruct.createObject<ThreeSidedGouradNoTextureSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (
      this.shading === "Flat" &&
      !this.isTextured &&
      this.colorMode === "Gradient"
    ) {
      this.packetDataType = PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_GRADIENT;

      this.packetData =
        threeSidedFlatNoTextureGradientStruct.createObject<ThreeSidedFlatNoTextureGradientData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (
      this.shading === "Gourad" &&
      !this.isTextured &&
      this.colorMode === "Gradient"
    ) {
      throw Error("Not implemented");
    } else if (this.shading === "Flat" && this.isTextured) {
      this.packetDataType = PrimitiveType.THREE_SIDED_FLAT_TEXTURE;

      this.packetData =
        threeSidedFlatTexturedStruct.createObject<ThreeSidedFlatTexturedData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (this.shading === "Gourad" && this.isTextured) {
      this.packetDataType = PrimitiveType.THREE_SIDED_GOURAD_TEXTURE;

      this.packetData =
        threeSidedGouradTexturedStruct.createObject<ThreeSidedGouradTexturedData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    }
  }

  private setThreeSidedPolygonWithoutLight(arrayBuffer: ArrayBuffer) {
    if (!this.isTextured && this.colorMode === "Solid") {
      this.packetDataType = PrimitiveType.THREE_SIDED_NO_LIGHT_NO_TEXTURE_SOLID;

      this.packetData =
        threeSidedNoLightNoTextureSolidStruct.createObject<ThreeSidedNoLightNoTextureSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (!this.isTextured && this.colorMode === "Gradient") {
      throw Error("Not implemented");
    } else if (this.colorMode === "Solid" && this.isTextured) {
      this.packetDataType = PrimitiveType.THREE_SIDED_NO_LIGHT_TEXTURE_SOLID;

      this.packetData =
        threeSidedNoLightTexturedSolidStruct.createObject<ThreeSidedNoLightTexturedSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (this.colorMode === "Gradient" && this.isTextured) {
      throw Error("Not implemented");
    }
  }

  private setFourSidedPolygonWithLight(arrayBuffer: ArrayBuffer) {
    if (
      this.shading === "Flat" &&
      !this.isTextured &&
      this.colorMode === "Solid"
    ) {
      throw Error("Not implemented");
    } else if (
      this.shading === "Gourad" &&
      !this.isTextured &&
      this.colorMode === "Solid"
    ) {
      this.packetDataType = PrimitiveType.FOUR_SIDED_GOURAD_NO_TEXTURE_SOLID;

      this.packetData =
        fourSidedGouradNoTextureSolidStruct.createObject<FourSidedGouradNoTextureSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (
      this.shading === "Flat" &&
      !this.isTextured &&
      this.colorMode === "Gradient"
    ) {
      throw Error("Not implemented");
    } else if (
      this.shading === "Gourad" &&
      !this.isTextured &&
      this.colorMode === "Gradient"
    ) {
      throw Error("Not implemented");
    } else if (this.shading === "Flat" && this.isTextured) {
      this.packetDataType = PrimitiveType.FOUR_SIDED_FLAT_TEXTURE_NO_COLOR;

      this.packetData =
        fourSidedFlatTexturedNoColorStruct.createObject<FourSidedFlatTexturedNoColorData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (this.shading === "Gourad" && this.isTextured) {
      this.packetDataType = PrimitiveType.FOUR_SIDED_GOURAD_TEXTURE;

      this.packetData =
        fourSidedGouradTexturedStruct.createObject<FourSidedGouradTexturedData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    }
  }

  private setFourSidedPolygonWithoutLight(arrayBuffer: ArrayBuffer) {
    if (!this.isTextured && this.colorMode === "Solid") {
      this.packetDataType = PrimitiveType.FOUR_SIDED_NO_LIGHT_NO_TEXTURE_SOLID;

      this.packetData =
        fourSidedNoLightNoTextureSolidStruct.createObject<FourSidedNoLightNoTextureSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (!this.isTextured && this.colorMode === "Gradient") {
      throw Error("Not implemented");
    } else if (this.colorMode === "Solid" && this.isTextured) {
      this.packetDataType = PrimitiveType.FOUR_SIDED_NO_LIGHT_TEXTURED_SOLID;

      this.packetData =
        fourSidedNoLightTexturedSolidStruct.createObject<FourSidedNoLightTexturedSolidData>(
          arrayBuffer,
          this.primitiveData.nextOffset,
          true,
        );
    } else if (this.colorMode === "Gradient" && this.isTextured) {
      throw Error("Not implemented");
    }
  }

  private setLine(arrayBuffer: ArrayBuffer) {
    if (this.colorMode === "Solid") {
      this.packetDataType = PrimitiveType.LINE_SOLID;

      this.packetData = lineSolidStruct.createObject<LineSolidData>(
        arrayBuffer,
        this.primitiveData.nextOffset,
        true,
      );
    } else if (this.colorMode === "Gradient") {
      this.packetDataType = PrimitiveType.LINE_GRADIENT;

      this.packetData = lineGradientStruct.createObject<LineGradientData>(
        arrayBuffer,
        this.primitiveData.nextOffset,
        true,
      );
    }
  }

  // Texture helpers, consider moving into packet data types or something...not sure these belong direclty in primitive
  getTextureXYPositionInVRAM() {
    if (this.isTextured && this.packetData) {
      if (this.texturePage! < 16) {
        return {
          x: this.texturePage! * 64,
          y: 0,
        };
      } else {
        return {
          x: (this.texturePage! - 16) * 64,
          y: 256,
        };
      }
    }

    throw Error("Unknown error");
  }

  get textureCLUTXPosition() {
    if (this.isTextured && this.packetData) {
      return (this.packetData.cba & 0b0000000000111111) << 4;
    }

    throw Error("Unknown error");
  }

  get textureCLUTYPosition() {
    if (this.isTextured && this.packetData) {
      return (this.packetData.cba & 0b0111111111000000) >> 6;
    }

    throw Error("Unknown error");
  }

  get texturePage() {
    if (this.isTextured && this.packetData) {
      return this.packetData.tsb & 0b0000000000011111;
    }

    throw Error("Unknown error");
  }

  get textureSemiTransparencyMethod() {
    if (this.isTextured && this.packetData) {
      const method = (this.packetData.tsb & 0b0000000001100000) >> 5;

      switch (method) {
        case 0:
          return "50 % background + 50 % polygon";
        case 1:
          return "100 % background + 100 % polygon";
        case 2:
          return "100 % background - 100 % polygon";
        case 3:
          return "100 % background + 25 % polygon";
      }
    }

    throw Error("Unknown error");
  }

  get textureBitsPerPixel() {
    if (this.isTextured && this.packetData) {
      const colorMode = (this.packetData.tsb & 0b0000000110000000) >> 7;
      if (colorMode === 0) {
        return 4;
      } else if (colorMode === 1) {
        return 8;
      } else if (colorMode === 2) {
        return 16;
      }
    }

    throw Error("Unknown error");
  }
  // End texture helpers
}
