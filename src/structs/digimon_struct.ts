import { Struct, StructData } from "@binary-files/structjs";

import { IS_LITTLE_ENDIAN } from "../constants";
import { DIGIMONS } from "../data/digimons";

export interface DigimonStructData extends StructData {
  nameCharacter0: number;
  nameCharacter1: number;
  nameCharacter2: number;
  nameCharacter3: number;
  nameCharacter4: number;
  nameCharacter5: number;
  nameCharacter6: number;
  nameCharacter7: number;
  nameCharacter8: number;
  nameCharacter9: number;
  nameCharacter10: number;
  nameCharacter11: number;
  nameCharacter12: number;
  nameCharacter13: number;
  nameCharacter14: number;
  nameCharacter15: number;
  nameCharacter16: number;
  nameCharacter17: number;
  nameCharacter18: number;
  nameCharacter19: number;

  numberOfNodes: number;

  radius: number;
  height: number;

  type: number;
  level: number;
}

const DigimonStruct = new Struct(
  Struct.Uint8("nameCharacter0"),
  Struct.Uint8("nameCharacter1"),
  Struct.Uint8("nameCharacter2"),
  Struct.Uint8("nameCharacter3"),
  Struct.Uint8("nameCharacter4"),
  Struct.Uint8("nameCharacter5"),
  Struct.Uint8("nameCharacter6"),
  Struct.Uint8("nameCharacter7"),
  Struct.Uint8("nameCharacter8"),
  Struct.Uint8("nameCharacter9"),
  Struct.Uint8("nameCharacter10"),
  Struct.Uint8("nameCharacter11"),
  Struct.Uint8("nameCharacter12"),
  Struct.Uint8("nameCharacter13"),
  Struct.Uint8("nameCharacter14"),
  Struct.Uint8("nameCharacter15"),
  Struct.Uint8("nameCharacter16"),
  Struct.Uint8("nameCharacter17"),
  Struct.Uint8("nameCharacter18"),
  Struct.Uint8("nameCharacter19"),

  Struct.Uint32("numberOfNodes"),

  Struct.Uint16("radius"),
  Struct.Uint16("height"),

  Struct.Uint8("type"),
  Struct.Uint8("level"),

  // TODO: map the rest of the info
  Struct.Skip(22),
);

export function newDigimonStruct(index: number) {
  return DigimonStruct.createObject<DigimonStructData>(
    DIGIMONS(),
    index * DigimonStruct.byteLength,
    IS_LITTLE_ENDIAN,
  );
}
