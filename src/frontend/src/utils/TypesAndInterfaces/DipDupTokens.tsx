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
  name: string
  symbol: string | null
  id: number
  decimals: number
  rate: number
}
