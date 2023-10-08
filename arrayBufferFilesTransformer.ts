import { readFileSync } from "fs";

const fileRegex = /\.(MMD|TIM|ARRAY_BUFFER)$/;

export default function transformer() {
  return {
    name: "array-buffer-files-transformer",

    transform(_src: string, id: string) {
      if (fileRegex.test(id)) {
        const fileBuffer = readFileSync(id);
        const content: Array<number> = [];

        for (let index = 0; index < fileBuffer.length; index++) {
          content.push(fileBuffer[index]);
        }

        return {
          code: `const content = new Uint8Array([${content}]).buffer;          
export default content;`,
          map: null,
        };
      }
    },
  };
}
