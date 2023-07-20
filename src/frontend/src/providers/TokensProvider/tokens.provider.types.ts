import { z } from 'zod'

import { normalizeTokenPrices } from './helpers/tokens.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

export const tokenMetadataSchema = z.object({
  icon: z.string().optional(),
  symbol: z.string(),
  decimals: z.string(),
})

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

type PropertiesFromDifferentTokenTypes = DeepPartial<{
  // loan & collateral tokens properties
  loanData: {
    indexerName: string
    isPausedCollateral: boolean
    isScaled: boolean
    isStaked: boolean
  }
}>

// loan token (market)
export interface LoansTokenMetadataType extends TokenMetadataType {
  loanData: {
    indexerName: string
  }
}

// collareral token
export interface LoansCollateralTokenMetadataType extends LoansTokenMetadataType {
  loanData: {
    indexerName: string
    isPausedCollateral: boolean
    isScaled: boolean
    isStaked: boolean
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
  updateTokensPrices: (feeds: SubsribeOracleDataFeedSubscription['aggregator']) => void
}

export type TokensContextState = Pick<TokensContext, 'tokensPrices' | 'collateralTokens' | 'tokensMetadata' | 'mTokens'>
