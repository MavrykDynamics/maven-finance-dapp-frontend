import { Dipdup_Token_Metadata } from 'utils/generated/graphqlTypes'

export type DipDupTokensGraphQl = Omit<Dipdup_Token_Metadata, '__typename'> & {
  metadata: {
    icon: string
    name: string
    symbol: string
    decimals: string
    thumbnailUri: string
    shouldPreferSymbol: string
  }
}

// NEW TYPES IMPLEMENT LATER WITH BACK-END
export type TokenMetadataFromGQLType = {
  icon: string | null
  name: string
  symbol: string | null
  decimals: string
}

export type DipDupTokenDataType = Omit<TokenMetadataFromGQLType, 'decimals'> & {
  id: number
  decimals: number
}

export type ContractMetadataType = {
  icon: string | null
}

export type TokenMetadataType = {
  icon: string | null
  rate: number | null
  name: string
  symbol: string
  id: number
  decimals: number
}
