import { bytes2Char } from "@taquito/utils";

export const bytesToString = (bytes: string) => {
  const slicedBytes = bytes.slice(12)
  return slicedBytes ?  bytes2Char(slicedBytes) : ''
}
