import arrayBufferFilesTransformer from "./arrayBufferFilesTransformer";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [arrayBufferFilesTransformer()],
};
