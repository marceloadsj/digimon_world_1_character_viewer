import "./style.css";

import Alpine from "alpinejs";

import { Artboard } from "./models/artboard";
import { Digimon } from "./models/digimon";
import { MMD_POINTERS } from "./data/mmds";
import { ANIMATIONS } from "./contents/animations";
import { Info } from "./models/info";
import {
  GAME_BYTE_LENGTH,
  PSX_SECTOR_FOOTER_SIZE,
  PSX_SECTOR_HEADER_SIZE,
  PSX_SECTOR_SIZE,
} from "./constants";

interface SetupData {
  status: "idle" | "loading" | "error" | "success";
  initListener(): void;
  selectFile(): void;
}

interface InitialData {
  INFOS: Array<Info | null>;
  ANIMATIONS: typeof ANIMATIONS;

  initialized: boolean;

  digimon: Digimon | null;
  index: number;
  animationIndex: number;

  init(): void;
  setIndex(index: number): void;
  setAnimationIndex(index: number): void;
}

function init() {
  const artboard = new Artboard();
  const { digimon, animation } = getUrlParams();

  const INFOS = MMD_POINTERS.map((mmd, index) =>
    mmd ? new Info({ index }) : null,
  ).filter((info) => info != null);

  const initialData: InitialData = {
    INFOS,
    ANIMATIONS: ANIMATIONS,

    initialized: false,

    digimon: null,
    index: digimon,
    animationIndex: animation,

    init() {
      this.digimon = newDigimon(artboard, this.index, this.animationIndex);
    },

    setIndex(index: number) {
      this.index = index;
      this.animationIndex = 0;

      this.digimon?.remove();

      artboard.reset();
      this.digimon = newDigimon(artboard, this.index, this.animationIndex);

      setUrlParams();
    },

    setAnimationIndex(index: number) {
      this.animationIndex = index;

      if (this.digimon) {
        this.digimon.setAnimationIndex(this.animationIndex);
      }

      setUrlParams();
    },
  };

  Alpine.store("data", initialData);

  initPointerListeners(artboard);
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);

  const digimonIndex = urlParams.get("digimon");
  const digimon =
    !digimonIndex || Number.isNaN(digimonIndex) ? 3 : parseInt(digimonIndex);

  const animationIndex = urlParams.get("animation");
  const animation =
    !animationIndex || Number.isNaN(animationIndex)
      ? 0
      : parseInt(animationIndex);

  return { digimon, animation };
}

function setUrlParams() {
  const data = Alpine.store("data") as InitialData;

  const queryParams = `?digimon=${data.index}&animation=${data.animationIndex}`;
  window.history.pushState({ path: queryParams }, "", queryParams);
}

function newDigimon(artboard: Artboard, index: number, animationIndex: number) {
  return new Digimon({
    artboard: artboard,
    index: index,
    animationIndex: animationIndex,
  });
}

function initPointerListeners(artboard: Artboard) {
  const data = Alpine.store("data") as InitialData;

  let [x, y] = [-1, -1];

  window.addEventListener("pointerdown", (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.tagName === "CANVAS"
    ) {
      x = event.offsetX;
      y = event.offsetY;
    }
  });

  window.addEventListener("pointermove", (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.tagName === "CANVAS"
    ) {
      if (data.digimon?.rootNode) {
        if (x > 0 || y > 0) {
          const parsedX = (event.offsetY - y) / 100;
          const parsedY = (event.offsetX - x) / 100;

          data.digimon.rootNode.rotation.x += parsedX;
          data.digimon.rootNode.rotation.y += parsedY;

          artboard.floorObject.rotation.x += parsedX;
          artboard.floorObject.rotation.z += parsedY; // Using Z to rotate the plane correctly

          x = event.offsetX;
          y = event.offsetY;

          artboard.render();
        }
      }
    }
  });

  window.addEventListener("pointerup", (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.tagName === "CANVAS"
    ) {
      x = -1;
      y = -1;
    }
  });
}

const setupData: SetupData = {
  status: "idle",

  // Set the listener up so the user can selects the file
  initListener() {
    const fileInput = document.getElementById(
      "fileInput",
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.addEventListener("change", async () => {
        this.status = "loading";

        const currentFile = fileInput.files?.[0];

        currentFile?.arrayBuffer().then((value) => {
          // Recognize the correct bin file by the exact byte length
          if (value.byteLength !== GAME_BYTE_LENGTH) {
            this.status = "error";
            return;
          }

          const numberOfSectors = value.byteLength / PSX_SECTOR_SIZE;
          const cleanSectorByteLength =
            PSX_SECTOR_SIZE - PSX_SECTOR_HEADER_SIZE - PSX_SECTOR_FOOTER_SIZE;

          // Cleanup the whole BIN, by removing all sector headers and footers (used by psx for debugging purposes)
          const uInt8Array = new Uint8Array(
            numberOfSectors * cleanSectorByteLength,
          );

          for (
            let index = 0;
            index <= value.byteLength / PSX_SECTOR_SIZE;
            index++
          ) {
            const sectorStart =
              index * PSX_SECTOR_SIZE + PSX_SECTOR_HEADER_SIZE;
            const sectorEnd =
              (index + 1) * PSX_SECTOR_SIZE - PSX_SECTOR_FOOTER_SIZE;

            const sector = new Uint8Array(value.slice(sectorStart, sectorEnd));

            uInt8Array.set(sector, index * cleanSectorByteLength);
          }

          // Store the cleaned BIN so we consume later to extract the models and so on
          window.value = uInt8Array.buffer;

          init();

          this.status = "success";
        });
      });
    }
  },

  // The method that runs when user clicks the btn to select the file
  selectFile() {
    if (this.status === "idle" || this.status === "error") {
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.click();
    }
  },
};

Alpine.store("setup", setupData);
Alpine.start();
