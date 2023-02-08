import { MichelsonType, unpackDataBytes } from "@taquito/michel-codec";
import {Schema} from '@taquito/michelson-encoder'

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

export const keyHashBytesToString = (textInBytes: string): string => {
  const schema = new Schema(addressType);
  const formattedBytes = { bytes: textInBytes }
  // @ts-ignore
  const dataCustom = schema.Execute(formattedBytes, { ticket: (val) => val.args[1].string})
  return JSON.stringify(dataCustom)
}
