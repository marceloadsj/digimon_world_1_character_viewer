export function mergeArrayBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
  const uInt8Array = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  uInt8Array.set(new Uint8Array(buffer1), 0);
  uInt8Array.set(new Uint8Array(buffer2), buffer1.byteLength);
  return uInt8Array.buffer;
}
