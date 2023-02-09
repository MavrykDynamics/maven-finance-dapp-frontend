import { MichelsonType, unpackDataBytes } from '@taquito/michel-codec'
import { Schema } from '@taquito/michelson-encoder'

export const BYTES_ADDRESS_TYPE = 'ADDRESS'
export const BYTES_STRING_TYPE = 'STRING'

export type BytesType = typeof BYTES_ADDRESS_TYPE | typeof BYTES_STRING_TYPE

const stringType: MichelsonType = {
  prim: 'string',
}

const addressType: MichelsonType = {
  prim: 'address',
}

export const bytesToText = (bytes: string) => {
  const bytesData = { bytes }

  const data = unpackDataBytes(bytesData, stringType)
  return Object.values(data)[0]
}

export const bytesToAddress = (bytes: string): string => {
  const schema = new Schema(addressType)
  const bytesData = { bytes }
  // @ts-ignore
  const dataCustom = schema.Execute(bytesData, { ticket: (val) => val.args[1].string })
  return dataCustom
}
