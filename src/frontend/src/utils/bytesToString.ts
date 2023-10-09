import { MichelsonType, unpackDataBytes } from '@taquito/michel-codec'
import { z } from 'zod'

export const BYTES_ADDRESS_TYPE = 'ADDRESS'
export const BYTES_STRING_TYPE = 'STRING'

export type BytesType = typeof BYTES_ADDRESS_TYPE | typeof BYTES_STRING_TYPE

const stringType: MichelsonType = {
  prim: 'string',
}

const addressType: MichelsonType = {
  prim: 'address',
}

const byteSchema = z.array(z.object({ bytes: z.string() }))
const stringSchema = z.object({ string: z.string() })
const intSchema = z.object({ int: z.string() })

/**
 * @deprecated
 */
export const bytesToText = (bytes: string) => {
  try {
    const data = unpackDataBytes({ bytes }, stringType)

    const parseBytesData = byteSchema.safeParse(data)
    const parseIntData = intSchema.safeParse(data)

    if (parseBytesData.success) {
      return parseBytesData.data[0].bytes
    }

    if (parseIntData.success) {
      return parseIntData.data.int
    }

    if (parseBytesData.error || parseIntData.error) {
      console.error('parsing bytes to text error:', parseBytesData.error || parseIntData.error)
      return ''
    }

    return ''
  } catch (e) {
    console.log('bytesToText', e)
    return ''
  }
}

// TODO it is not the best way, but it will work for tz address.
const getAddressForDecoding = (addressInBytes: string) => {
  switch (addressInBytes.length) {
    // 58 - keyHash length
    case 58: {
      const prefix = '050a'
      const publicKeyLength = '000000160000'
      const keyHashPrefixLength = 18

      return prefix + publicKeyLength + addressInBytes.slice(keyHashPrefixLength)
    }
    default:
      return addressInBytes
  }
}

const getBytesUnpackedData = (bytes: string, bytesValueType: BytesType) => {
  if (bytesValueType === BYTES_ADDRESS_TYPE) {
    const addressToDecode = getAddressForDecoding(bytes)
    return unpackDataBytes({ bytes: addressToDecode }, addressType)
  } else {
    return unpackDataBytes({ bytes }, stringType)
  }
}

export const convertBytes = (bytes: string, bytesValueType: BytesType) => {
  const unpackedBytesData = getBytesUnpackedData(bytes, bytesValueType)

  const parseStringData = stringSchema.safeParse(unpackedBytesData)
  const parseBytesData = byteSchema.safeParse(unpackedBytesData)
  const parseIntData = intSchema.safeParse(unpackedBytesData)

  if (parseStringData.success) return parseStringData.data.string
  if (parseBytesData.success) return parseBytesData.data[0].bytes
  if (parseIntData.success) return parseIntData.data.int

  console.error('parsing bytes to text error:', parseBytesData.error ?? parseIntData.error ?? parseStringData.error)
  return ''
}
