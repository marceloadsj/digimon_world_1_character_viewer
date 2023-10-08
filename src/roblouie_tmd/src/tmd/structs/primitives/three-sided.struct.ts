import { Struct, StructData } from "@binary-files/structjs";

export interface ThreeSidedFlatNoTextureSolidData extends StructData {
  red: number;
  green: number;
  blue: number;
  mode: number;
  normal0: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const threeSidedFlatNoTextureSolidStruct = new Struct(
  Struct.Uint8("red"),
  Struct.Uint8("green"),
  Struct.Uint8("blue"),
  Struct.Uint8("mode"),
  Struct.Uint16("normal0"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("vertex2"),
);

export interface ThreeSidedGouradNoTextureSolidData extends StructData {
  red: number;
  green: number;
  blue: number;
  mode: number;
  normal0: number;
  vertex0: number;
  normal1: number;
  vertex1: number;
  normal2: number;
  vertex2: number;
}

export const threeSidedGouradNoTextureSolidStruct = new Struct(
  Struct.Uint8("red"),
  Struct.Uint8("green"),
  Struct.Uint8("blue"),
  Struct.Uint8("mode"),
  Struct.Uint16("normal0"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("normal1"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("normal2"),
  Struct.Uint16("vertex2"),
);

export interface ThreeSidedFlatNoTextureGradientData extends StructData {
  red0: number;
  green0: number;
  blue0: number;
  mode: number;
  red1: number;
  green1: number;
  blue1: number;
  red2: number;
  green2: number;
  blue2: number;
  normal0: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const threeSidedFlatNoTextureGradientStruct = new Struct(
  Struct.Uint8("red0"),
  Struct.Uint8("green0"),
  Struct.Uint8("blue0"),
  Struct.Uint8("mode"),
  Struct.Uint8("red1"),
  Struct.Uint8("green1"),
  Struct.Uint8("blue1"),
  Struct.Uint8("unused0"),
  Struct.Uint8("red2"),
  Struct.Uint8("green2"),
  Struct.Uint8("blue2"),
  Struct.Uint8("unused1"),
  Struct.Uint16("normal0"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("vertex2"),
);

export interface ThreeSidedFlatTexturedData extends StructData {
  u0: number;
  v0: number;
  cba: number;
  u1: number;
  v1: number;
  tsb: number;
  u2: number;
  v2: number;
  unused: number;
  normal0: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const threeSidedFlatTexturedStruct = new Struct(
  Struct.Uint8("u0"),
  Struct.Uint8("v0"),
  Struct.Uint16("cba"), //clut info
  Struct.Uint8("u1"),
  Struct.Uint8("v1"),
  Struct.Uint16("tsb"), // texture page info
  Struct.Uint8("u2"),
  Struct.Uint8("v2"),
  Struct.Uint16("unused"),
  Struct.Uint16("normal0"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("vertex2"),
);

export interface ThreeSidedGouradTexturedData extends StructData {
  u0: number;
  v0: number;
  cba: number;
  u1: number;
  v1: number;
  tsb: number;
  u2: number;
  v2: number;
  unused: number;
  normal0: number;
  vertex0: number;
  normal1: number;
  vertex1: number;
  normal2: number;
  vertex2: number;
}

export const threeSidedGouradTexturedStruct = new Struct(
  Struct.Uint8("u0"),
  Struct.Uint8("v0"),
  Struct.Uint16("cba"), //clut info
  Struct.Uint8("u1"),
  Struct.Uint8("v1"),
  Struct.Uint16("tsb"), // texture page info
  Struct.Uint8("u2"),
  Struct.Uint8("v2"),
  Struct.Uint16("unused"),
  Struct.Uint16("normal0"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("normal1"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("normal2"),
  Struct.Uint16("vertex2"),
);

export interface ThreeSidedNoLightNoTextureSolidData extends StructData {
  red: number;
  green: number;
  blue: number;
  mode: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const threeSidedNoLightNoTextureSolidStruct = new Struct(
  Struct.Uint8("red"),
  Struct.Uint8("green"),
  Struct.Uint8("blue"),
  Struct.Uint8("mode"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("vertex2"),
  Struct.Uint16("unused"),
);

export interface ThreeSidedNoLightTexturedSolidData extends StructData {
  u0: number;
  v0: number;
  cba: number;
  u1: number;
  v1: number;
  tsb: number;
  u2: number;
  v2: number;
  red: number;
  green: number;
  blue: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const threeSidedNoLightTexturedSolidStruct = new Struct(
  Struct.Uint8("u0"),
  Struct.Uint8("v0"),
  Struct.Uint16("cba"), //clut info
  Struct.Uint8("u1"),
  Struct.Uint8("v1"),
  Struct.Uint16("tsb"), // texture page info
  Struct.Uint8("u2"),
  Struct.Uint8("v2"),
  Struct.Uint16("unused0"),
  Struct.Uint8("red"),
  Struct.Uint8("green"),
  Struct.Uint8("blue"),
  Struct.Uint8("unused1"),
  Struct.Uint16("vertex0"),
  Struct.Uint16("vertex1"),
  Struct.Uint16("vertex2"),
  Struct.Uint16("unused2"),
);
