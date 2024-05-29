import { MVRK_TOKEN_ADDRESS } from 'utils/constants'
import {
  LoansTokenMetadataType,
  LoansCollateralTokenMetadataType,
  TokenMetadataType,
  TokenAddressType,
  TokensContext,
  FarmsTokenMetadataType,
  M_TokenMetadataType,
} from '../tokens.provider.types'

export const checkWhetherTokenIsLoanToken = (token: TokenMetadataType): token is LoansTokenMetadataType =>
  Boolean(token.loanData)

export const checkWhetherTokenIsFarmToken = (token: TokenMetadataType): token is FarmsTokenMetadataType =>
  Boolean(token.farmLpData)

export const checkWhetherTokenIsM_Token = (token: TokenMetadataType): token is M_TokenMetadataType =>
  Boolean(token.mToken)

export const checkWhetherTokenIsCollateralToken = (
  token: TokenMetadataType,
): token is LoansCollateralTokenMetadataType =>
  Boolean(token.loanData) &&
  typeof token.loanData?.isPausedCollateral === 'boolean' &&
  typeof token.loanData?.isScaled === 'boolean' &&
  typeof token.loanData?.isStaked === 'boolean'

export const isTezosAsset = (tokenAddress?: TokenAddressType) => tokenAddress === MVRK_TOKEN_ADDRESS

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

  const tokenRate = tokensPrices?.[tokenMetadata.symbol] ?? 1

  if (!tokenRate) return { ...tokenMetadata, rate: null }

  return { ...tokenMetadata, rate: tokenRate }
}
