import { timLoader } from "../roblouie_tmd/src/loaders/tim-loader";
import { TIM } from "../roblouie_tmd/src/tim/tim";

import { ALLTIM } from "../data/tims";

const TIM_BYTE_LENGTH = 0x00004800;

export type Tim = TIM;

export function newTim(index: number) {
  const startOffset = index * TIM_BYTE_LENGTH;
  const tim = ALLTIM().slice(startOffset, startOffset + TIM_BYTE_LENGTH);

  return timLoader.getTIMsFromTIMFile(tim)[0];
}
