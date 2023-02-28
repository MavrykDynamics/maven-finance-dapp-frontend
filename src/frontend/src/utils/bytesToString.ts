import { MichelsonType, unpackDataBytes } from '@taquito/michel-codec'

export const BYTES_ADDRESS_TYPE = 'ADDRESS'
export const BYTES_STRING_TYPE = 'STRING'

export type BytesType = typeof BYTES_ADDRESS_TYPE | typeof BYTES_STRING_TYPE

const stringType: MichelsonType = {
  prim: 'string',
}

export const bytesToText = (bytes: string) => {
  try {
    const bytesData = { bytes }

    const data = unpackDataBytes(bytesData, stringType)
    return Object.values(data)[0] || ''
  } catch (e) {
    console.log('bytesToText', e)
    return ''
  }
}
