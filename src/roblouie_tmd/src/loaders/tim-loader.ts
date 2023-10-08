import { TIM } from "../tim/tim";

// TIM assets are often packed together in one file, either in one .tim file with multiple tims inside,
// or in larger packaged data. This class will pull multiple tims out of those files.
export class TIMLoader {
  private readonly MinimumTIMSize = 16;

  getTIMsFromTIMFile(arrayBuffer: ArrayBuffer): TIM[] {
    const tims: TIM[] = [];

    const firstTIM = new TIM(arrayBuffer);
    let nextOffset = firstTIM.byteLength;
    tims.push(firstTIM);

    while (nextOffset < arrayBuffer.byteLength - this.MinimumTIMSize) {
      try {
        const tim = new TIM(arrayBuffer, nextOffset);
        tims.push(tim);
        nextOffset += tim.byteLength;
      } catch (_) {
        nextOffset += 8;
      }
    }
    return tims;
  }
}

export const timLoader = new TIMLoader();
