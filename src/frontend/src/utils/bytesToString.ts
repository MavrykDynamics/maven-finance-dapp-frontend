import { MichelsonType, unpackDataBytes } from "@taquito/michel-codec";

export const BYTES_ADDRESS_TYPE = 'address'
export const BYTES_STRING_TYPE = 'string'

const stringType: MichelsonType = {
  prim: 'string',
};

const addressType: MichelsonType = {
  prim: 'address',
};

export type BytesType = typeof BYTES_ADDRESS_TYPE | typeof BYTES_STRING_TYPE

export const bytesToString = (bytes: string, type?: BytesType) => {
  const bytesData = { bytes }
  const bytesType = type === BYTES_ADDRESS_TYPE ? addressType : stringType

  const data = unpackDataBytes(bytesData, bytesType)
  return Object.values(data)[0]
}
