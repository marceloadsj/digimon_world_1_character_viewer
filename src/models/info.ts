import { newDigimonStruct, DigimonStructData } from "../structs/digimon_struct";
import { newTim, Tim } from "../structs/tim";

// const ICON_SIZE = 32;
// const ICON_SRC_X = 224;
// const ICON_SRC_Y = 96;

export class Info {
  index: number;

  // Information extracted from the data files
  digimonStruct: DigimonStructData;

  tim: Tim;
  // icon: ImageData | null;

  constructor({ index }: { index: number }) {
    // The order of initialization is important as some fields depends on others
    this.index = index;

    this.digimonStruct = newDigimonStruct(this.index);

    this.tim = newTim(this.index);
    // this.icon = this.newIcon();
  }

  // private newIcon() {
  //   try {
  //     const imageData = this.tim.createImageData(0, 503);

  //     if (imageData) {
  //       const icon = new ImageData(ICON_SIZE, ICON_SIZE);

  //       for (let height = 0; height < ICON_SIZE; height++) {
  //         for (let width = 0; width < ICON_SIZE; width++) {
  //           const srcIndex =
  //             256 * 4 * (ICON_SRC_Y + height) + (ICON_SRC_X + width) * 4;

  //           const index = ICON_SIZE * 4 * height + width * 4;

  //           icon.data[index] = imageData.data[srcIndex];
  //           icon.data[index + 1] = imageData.data[srcIndex + 1];
  //           icon.data[index + 2] = imageData.data[srcIndex + 2];
  //           icon.data[index + 3] = imageData.data[srcIndex + 3];
  //         }
  //       }

  //       return icon;
  //     }
  //   } catch (_) {}

  //   return null;
  // }

  get name() {
    return Array(20)
      .fill(null)
      .map((_, index) => {
        const nameCharacterKey =
          `nameCharacter${index}` as keyof DigimonStructData;

        const nameCharacterValue = this.digimonStruct[nameCharacterKey];

        if (nameCharacterValue) {
          return String.fromCharCode(nameCharacterValue);
        }

        return "";
      })
      .join("");
  }
}
