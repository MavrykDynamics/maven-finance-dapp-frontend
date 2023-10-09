// types
import { MichelsonType, unpackDataBytes } from '@taquito/michel-codec'

const transformKeyHashWithPrefix = (keyHash: string) => {
  // TODO it is not a better way, but it will be working for tz address.
  // I am searching new solution for it.
  const prefix = '050a'
  const publicKeyLength = '000000160000'
  const keyHashPrefixLength = 18

  return prefix + publicKeyLength + keyHash.slice(keyHashPrefixLength)
}

const getAddressForDecoding = (address: string) => {
  switch (address.length) {
    case 58: // 58 - keyHash length
      return transformKeyHashWithPrefix(address)
    default:
      return address
  }
}

/**
 * @deprecated
 */
export function convertBytesAddressToAddress(addressInBytes: string): string {
  try {
    const addressType: MichelsonType = {
      prim: 'address',
    }

    const address = getAddressForDecoding(addressInBytes)

    const formattedBytes = { bytes: address }
    const unpackedBytes = unpackDataBytes(formattedBytes, addressType)
    const jsonString = JSON.parse(JSON.stringify(unpackedBytes))
    return jsonString['string']
  } catch (e) {
    console.log('convertBytesAddressToAddress: ', e)
    return ''
  }
}
