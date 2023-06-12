import {
  LoansTokenMetadataType,
  LoansCollateralTokenMetadataType,
  TokenMetadataType,
  TokenAddressType,
} from '../tokens.provider.types'

export const checkWhetherTokenIsLoanToken = (token: TokenMetadataType): token is LoansTokenMetadataType =>
  Boolean(token.loanData)

export const checkWhetherTokenIsCollateralToken = (
  token: TokenMetadataType,
): token is LoansCollateralTokenMetadataType =>
  Boolean(token.loanData) && typeof token.loanData?.isProtectedCollateral === 'boolean'

export const isTezosAsset = (tokenAddress?: TokenAddressType) => tokenAddress === 'XTZ'
