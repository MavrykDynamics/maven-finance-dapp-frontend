import { normalizeTokenPrices } from './helpers/tokens.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'
import { FullFeedsQueryType, SmallFeedsQueryType } from 'providers/DataFeedsProvider/helpers/feeds.schemas'

export type TokenAddressType = string

// Full token metadata type
export type TokenMetadataType = {
  id: number
  address: TokenAddressType
  name: string
  symbol: string
  decimals: number
  icon: string
  type: TokenType
} & DeepPartial<{
  // Loan tokens fields (market tokens, collateral tokens)
  loanData: {
    indexerName: string
    minDepositAmount: number
    isPausedCollateral: boolean
    isScaled: boolean
    isStaked: boolean
  }
  // Farms LP tokens fields
  farmLpData: {
    token1: {
      address: TokenAddressType
      name: string
      symbol: string
      decimals: number
      icon: string
    } | null
    token0: {
      address: TokenAddressType
      name: string
      symbol: string
      decimals: number
      icon: string
    } | null
  }
  // M tokens fields
  mToken: {
    interestRateDecimals: number
  }
}>

// loan token metadata
export interface LoansTokenMetadataType extends TokenMetadataType {
  loanData: {
    indexerName: string
    minDepositAmount: number
  }
}

// collareral token metadata
export interface LoansCollateralTokenMetadataType extends LoansTokenMetadataType {
  loanData: {
    indexerName: string
    minDepositAmount: number
    isPausedCollateral: boolean
    isScaled: boolean
    isStaked: boolean
  }
}

// farms tokens
export interface FarmsTokenMetadataType extends TokenMetadataType {
  farmLpData: {
    token1: {
      address: TokenAddressType
      name: string
      symbol: string
      decimals: number
      icon: string
    } | null
    token0: {
      address: TokenAddressType
      name: string
      symbol: string
      decimals: number
      icon: string
    } | null
  }
}

// mToken
export interface M_TokenMetadataType extends TokenMetadataType {
  mToken: {
    interestRateDecimals: number
  }
}

// mToken in user store type
export type UserMTokenType = {
  lendValue: number
  interestEarned: number
}

type TokensPricesType = ReturnType<typeof normalizeTokenPrices>

// Context types
export type TokensContext = TokensContextStateType & {
  isLoading: boolean

  updateTokensPrices: (feeds: FullFeedsQueryType | SmallFeedsQueryType) => void
}

export type TokensContextStateType = {
  collateralTokens: Array<TokenAddressType>
  mTokens: Array<TokenAddressType>
  farmLpTokens: Array<TokenAddressType>
  tokensMetadata: Record<TokenAddressType, TokenMetadataType>
  tokensPrices: TokensPricesType
}
