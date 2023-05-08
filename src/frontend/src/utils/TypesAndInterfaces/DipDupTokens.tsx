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
