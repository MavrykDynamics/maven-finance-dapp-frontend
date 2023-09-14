import { z } from 'zod'

import { normalizeTokenPrices } from './helpers/tokens.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'
import { FullFeedsQueryType, SmallFeedsQueryType } from 'providers/DataFeedsProvider/helpers/feeds.schemas'

export const tokenMetadataSchema = z.object({
  icon: z.string().optional(),
  symbol: z.string(),
  decimals: z.string(),
})

export type TokenIndexerMetadataType = z.infer<typeof tokenMetadataSchema>

export const mTokenMetadataSchema = z.object({
  assets: z.array(
    z.object({
      decimals: z.string(),
    }),
  ),
})

export type TokenAddressType = string

// regular token
export type TokenMetadataType = {
  id: number
  address: TokenAddressType
  name: string
  symbol: string
  decimals: number
  icon: string
  type: TokenType
} & PropertiesFromDifferentTokenTypes

export type TokenLoansDataType = {
  indexerName: string
  minDepositAmount: number
  isPausedCollateral: boolean
  isScaled: boolean
  isStaked: boolean
}

type PropertiesFromDifferentTokenTypes = DeepPartial<{
  // loan & collateral tokens properties
  loanData: TokenLoansDataType
  mToken: {
    interestRateDecimals: number
  }
}>

// loan token (market)
export interface LoansTokenMetadataType extends TokenMetadataType {
  loanData: {
    indexerName: string
    minDepositAmount: number
  }
}

// collareral token
export interface LoansCollateralTokenMetadataType extends LoansTokenMetadataType {
  loanData: {
    indexerName: string
    minDepositAmount: number
    isPausedCollateral: boolean
    isScaled: boolean
    isStaked: boolean
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
export type TokensContext = {
  // data
  collateralTokens: Array<TokenAddressType>
  mTokens: Array<TokenAddressType>
  tokensMetadata: Record<TokenAddressType, TokenMetadataType>
  tokensPrices: TokensPricesType
  isLoading: boolean
  // methods
  updateTokensPrices: (feeds: FullFeedsQueryType | SmallFeedsQueryType) => void
}

export type TokensContextState = Pick<TokensContext, 'tokensPrices' | 'collateralTokens' | 'tokensMetadata' | 'mTokens'>
