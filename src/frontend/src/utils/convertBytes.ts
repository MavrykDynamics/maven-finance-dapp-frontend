import { MichelsonType, unpackDataBytes } from '@mavrykdynamics/webmavryk-michel-codec'
import { z } from 'zod'

// bytes types
export const BYTES_ADDRESS_TYPE = 'ADDRESS'
export const BYTES_STRING_TYPE = 'STRING'
export type BytesType = typeof BYTES_ADDRESS_TYPE | typeof BYTES_STRING_TYPE

// unpacking bytes types
const stringType: MichelsonType = {
  prim: 'string',
}
const addressType: MichelsonType = {
  prim: 'address',
}

// parsing converted bytes schemes
const byteSchema = z.array(z.object({ bytes: z.string() }))
const stringSchema = z.object({ string: z.string() })
const intSchema = z.object({ int: z.string() })

// decoding address consts
const prefix = '050a'
const publicKeyLength = '000000160000'
const keyHashPrefixLength = 18

// TODO: it's not the best way, but it works for tz address (by @CasualJackie)
const getAddressForDecoding = (addressInBytes: string) => {
  switch (addressInBytes.length) {
    case 58:
      return `${prefix}${publicKeyLength}${addressInBytes.slice(keyHashPrefixLength)}`
    default:
      return addressInBytes
  }
}

const getBytesUnpackedData = (bytes: string, bytesValueType: BytesType) => {
  switch (bytesValueType) {
    case BYTES_ADDRESS_TYPE:
      return unpackDataBytes({ bytes: getAddressForDecoding(bytes) }, addressType)
    case BYTES_STRING_TYPE:
      return unpackDataBytes({ bytes }, stringType)
  }
}

/**
 * util for converting back-end bytes to utf-8 text
 * @param bytes bytes string from indexer
 * @param bytesValueType whether it's address or just a text
 * @returns conveted string from bytes
 */
export const convertBytes = (bytes: string, bytesValueType: BytesType) => {
  const unpackedBytesData = getBytesUnpackedData(bytes, bytesValueType)

  const parseStringData = stringSchema.safeParse(unpackedBytesData)
  const parseBytesData = byteSchema.safeParse(unpackedBytesData)
  const parseIntData = intSchema.safeParse(unpackedBytesData)

  if (parseStringData.success) return parseStringData.data.string
  if (parseBytesData.success) return parseBytesData.data[0].bytes
  if (parseIntData.success) return parseIntData.data.int

  console.error('parsing unpacked bytes error:', parseBytesData.error ?? parseIntData.error ?? parseStringData.error)
  return ''
}
