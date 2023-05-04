// types
import type { ContractAddressesState } from '../reducers/contractAddresses'
import type { AddressesGraphQl } from '../utils/TypesAndInterfaces/Addresses'
import { Dipdup_Token_Metadata, M_Token } from 'utils/generated/graphqlTypes'
import { MichelsonType, unpackDataBytes } from '@taquito/michel-codec'

export function normalizeAddressesStorage(storage: AddressesGraphQl): ContractAddressesState {
  return {
    farmAddress: { address: storage?.farm?.[0]?.address },
    farmFactoryAddress: { address: storage?.farm_factory?.[0]?.address },
    delegationAddress: { address: storage?.delegation?.[0]?.address },
    doormanAddress: { address: storage?.doorman?.[0]?.address },
    mvkTokenAddress: { address: storage?.mvk_token?.[0]?.address },
    governanceAddress: { address: storage?.governance?.[0]?.address },
    governanceFinancialAddress: { address: storage?.governance_financial?.[0]?.address },
    emergencyGovernanceAddress: {
      address: storage?.emergency_governance?.[0]?.address,
    },
    breakGlassAddress: { address: storage?.break_glass?.[0]?.address },
    councilAddress: { address: storage?.council?.[0]?.address },
    treasuryAddress: { address: storage?.delegation?.[0]?.address },
    treasuryFactoryAddress: {
      address: storage?.treasury_factory?.[0]?.address,
    },
    vestingAddress: { address: storage?.vesting?.[0]?.address },
    governanceSatelliteAddress: {
      address: storage?.governance_satellite?.[0]?.address,
    },
    aggregatorFactoryAddress: {
      address: storage?.aggregator_factory?.[0]?.address,
    },
    aggregatorAddress: { address: storage?.aggregator?.[0]?.address },
    governanceProxyAddress: { address: storage?.governance_proxy?.[0]?.address },
    lendingController: { address: storage?.lending_controller?.[0]?.address },
    vaultFactory: { address: storage?.vault_factory?.[0]?.address },
  }
}

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue)
  return keys.length > 0 ? keys[0] : null
}

export function normalizeDipDupTokens(storage: { dipdup_token_metadata?: Array<Dipdup_Token_Metadata> }) {
  return storage?.dipdup_token_metadata ?? []
}

export function normalizeDipDupContracts(storage: { dipdup_contract_metadata?: Array<Dipdup_Token_Metadata> }) {
  return storage?.dipdup_contract_metadata ?? []
}

export function normalizeMTokens(storage: { m_token: M_Token }) {
  return storage?.m_token || []
}

const getAddressForDecoding = (address: string) => {
  switch (address.length) {
    case 58: // 58 - keyHash length
      return transformKeyHashWithPrefix(address)
    default:
      return address
  }
}

const transformKeyHashWithPrefix = (keyHash: string) => {
  // TODO it is not a better way, but it will be working for tz address.
  // I am searching new solution for it.
  const prefix = '050a'
  const publicKeyLength = '000000160000'
  const keyHashPrefixLength = 18

  return prefix + publicKeyLength + keyHash.slice(keyHashPrefixLength)
}

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
    console.log('convertBytesAddressToAddress', e)
    return ''
  }
}

export function convertBytesStringToText(textInBytes: string): string {
  try {
    const stringType: MichelsonType = {
      prim: 'string',
    }
    const formattedBytes = { bytes: textInBytes }
    // @ts-ignore
    const unpackedBytes = unpackDataBytes(formattedBytes, stringType)
    const jsonString = JSON.parse(JSON.stringify(unpackedBytes))
    return jsonString['string']
  } catch (e) {
    console.log('convertBytesStringToText', e)
    return ''
  }
}
