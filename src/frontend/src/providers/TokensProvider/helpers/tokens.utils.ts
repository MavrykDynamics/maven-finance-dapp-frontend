import {
  LoansTokenMetadataType,
  LoansCollateralTokenMetadataType,
  TokenMetadataType,
  TokenAddressType,
  TokensContext,
} from '../tokens.provider.types'

export const checkWhetherTokenIsLoanToken = (token: TokenMetadataType): token is LoansTokenMetadataType =>
  Boolean(token.loanData)

export const checkWhetherTokenIsCollateralToken = (
  token: TokenMetadataType,
): token is LoansCollateralTokenMetadataType =>
  Boolean(token.loanData) && typeof token.loanData?.isProtectedCollateral === 'boolean'

export const isTezosAsset = (tokenAddress?: TokenAddressType) => tokenAddress === 'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg'

export const getTokenDataByAddress = ({
  tokenAddress,
  tokensMetadata,
  tokensPrices,
}: {
  tokenAddress?: string
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices?: TokensContext['tokensPrices']
}): (TokenMetadataType & { rate: number | null }) | null => {
  if (!tokenAddress) return null

  const tokenMetadata = tokensMetadata[tokenAddress]

  if (!tokenMetadata) return null

  const tokenRate = tokensPrices?.[tokenMetadata.symbol]

  if (!tokenRate) return { ...tokenMetadata, rate: null }

  return { ...tokenMetadata, rate: tokenRate }
}
