import { isTezosAsset } from 'pages/Loans/Loans.helpers'
import { State } from 'react-use/lib/useMouse'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import {
  ContractMetadataType,
  DipDupTokenDataType,
  TokenMetadataFromGQLType,
  TokenMetadataType,
} from 'utils/TypesAndInterfaces/DipDupTokens'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  Dipdup_Token_Metadata,
  M_Token,
  Treasury,
  Governance_Financial_Whitelist_Token_Contract,
} from 'utils/generated/graphqlTypes'
import { getSymbolAndNameFromFeedName } from 'utils/parse'

// Normalize Tokens
export function normalizeDipDupTokens(dipdup_token_metadata?: Array<Dipdup_Token_Metadata>) {
  return dipdup_token_metadata ?? []
}

export function normalizeDipDupContracts(dipdup_contract_metadata?: Array<Dipdup_Token_Metadata>) {
  return dipdup_contract_metadata ?? []
}

export function nomalizeDipDupTokensAndContracts(
  dipdup_token_metadata: Array<Dipdup_Token_Metadata>,
  dipdup_contract_metadata: Array<Dipdup_Token_Metadata>,
) {
  return [...dipdup_token_metadata, ...dipdup_contract_metadata].reduce<Record<string, DipDupTokenDataType>>(
    (acc, tokenData) => {
      const { contract, metadata, id } = tokenData
      const { icon = null, name, symbol = null, decimals = '0' } = (metadata ?? {}) as TokenMetadataFromGQLType

      if (!metadata || !name) return acc

      acc[contract] = {
        icon,
        name,
        symbol,
        id,
        decimals: parseInt(decimals),
      }
      return acc
    },
    {},
  )
}

export function nomalizeDipDupContracts(dipdup_contract_metadata: Array<Dipdup_Token_Metadata>) {
  return dipdup_contract_metadata.reduce<Record<string, ContractMetadataType>>((acc, tokenData) => {
    const { contract, metadata } = tokenData
    const { icon = null } = (metadata ?? {}) as TokenMetadataFromGQLType

    if (!icon) return acc

    acc[contract] = {
      icon,
    }
    return acc
  }, {})
}

export function nomalizeDipDupTokens(dipdup_contract_metadata: Array<Dipdup_Token_Metadata>, feeds: Array<Feed>) {
  const rates = feeds.reduce<Record<string, { rate: number; icon: string | undefined }>>(
    (acc, { name, last_completed_data, decimals, icon }) => {
      const assetSymbol = getSymbolAndNameFromFeedName(name).symbol
      const rate = convertNumberForClient({ number: last_completed_data, grade: decimals })
      acc[assetSymbol] = { rate, icon }
      return acc
    },
    {},
  )

  return dipdup_contract_metadata.reduce<Record<string, TokenMetadataType>>((acc, tokenData) => {
    const { contract, metadata, id } = tokenData
    const { icon = null, name, symbol = null, decimals = null } = (metadata ?? {}) as TokenMetadataFromGQLType

    if (!metadata || !name || !symbol || !decimals) return acc

    const symbolToSearch = symbol.toLowerCase()
    const { rate = null, icon: feedIcon } = rates[symbolToSearch] ?? {}
    const isXTZ = isTezosAsset(symbolToSearch)

    const tempIcon = isXTZ
      ? '/images/tezos.png'
      : symbolToSearch.includes('eurl')
      ? '/images/eurl.png'
      : symbolToSearch.includes('tzbtc')
      ? '/images/tzBTC.png'
      : icon ?? feedIcon ?? null

    const nameToDisplay = isXTZ ? 'XTZ' : symbol
    const symbolToDisplay = isXTZ ? 'tezos' : symbol

    acc[contract] = {
      icon: tempIcon,
      name: nameToDisplay,
      symbol: symbolToDisplay,
      decimals: parseInt(decimals),
      id,
      rate,
    }
    return acc
  }, {})
}

export function normalizeMTokens(m_token: M_Token) {
  return m_token || []
}

export function normalizeWhitelistTokens(whitelistTokens: Array<Treasury>) {
  return (
    (whitelistTokens?.[0]?.whitelist_token_contracts ?? ([] as Array<Governance_Financial_Whitelist_Token_Contract>))
      .map((tokenInfo) => ({
        symbol: tokenInfo.contract_name,
        address: tokenInfo.contract_address,
        shortSymbol: tokenInfo.token_contract_standard,
        id: 0,
      }))
      // TODO: remove this filter when back-end is ready for this
      .filter(({ symbol }) => symbol.toLowerCase() === 'mvk')
  )
}
