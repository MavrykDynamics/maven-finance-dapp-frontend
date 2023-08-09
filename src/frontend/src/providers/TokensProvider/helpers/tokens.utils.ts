import { XTZ_TOKEN_ADDRESS } from 'utils/constants'
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
  Boolean(token.loanData) &&
  typeof token.loanData?.isPausedCollateral === 'boolean' &&
  typeof token.loanData?.isScaled === 'boolean' &&
  typeof token.loanData?.isStaked === 'boolean'

export const isTezosAsset = (tokenAddress?: TokenAddressType) => tokenAddress === XTZ_TOKEN_ADDRESS

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

export const isLoansCollateralTokenMetadata = (token: unknown): token is LoansCollateralTokenMetadataType => {
  if (typeof token !== 'object' || token === null) {
    return false // The token is not an object, so it can't be of type LoansCollateralTokenMetadataType
  }

  const requiredProperties = ['id', 'address', 'name', 'symbol', 'decimals', 'icon', 'type', 'loanData']
  const requiredLoanDataProperties = ['indexerName', 'isPausedCollateral', 'isScaled', 'isStaked']

  for (const prop of requiredProperties) {
    if (!(prop in token)) {
      return false // The token doesn't have one of the required properties
    }
  }

  const { loanData } = token as LoansCollateralTokenMetadataType

  // checl loan data keys
  for (const prop of requiredLoanDataProperties) {
    if (!(prop in loanData)) {
      return false // The token doesn't have one of the required properties
    }
  }
  return true
}
