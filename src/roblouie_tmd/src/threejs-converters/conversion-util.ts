import * as THREE from "three";
import { NormalData } from "../tmd/structs/normal.struct";

export const conversionUtil = {
  combineRGBBytes(red: number, green: number, blue: number) {
    return (red << 16) | (green << 8) | blue;
  },

  getThreeJSNormalFromIndex(normals: Array<NormalData>, index: number) {
    const normal = normals[index % normals.length];
    return new THREE.Vector3(normal.x, normal.y, normal.z);
  },
};
