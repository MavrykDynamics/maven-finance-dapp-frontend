import { MichelsonType, unpackDataBytes } from '@taquito/michel-codec'
import { z } from 'zod'

export const BYTES_ADDRESS_TYPE = 'ADDRESS'
export const BYTES_STRING_TYPE = 'STRING'

export type BytesType = typeof BYTES_ADDRESS_TYPE | typeof BYTES_STRING_TYPE

const stringType: MichelsonType = {
  prim: 'string',
}

const byteSchema = z.array(z.object({ bytes: z.string() }))
const intSchema = z.object({ int: z.string() })

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
