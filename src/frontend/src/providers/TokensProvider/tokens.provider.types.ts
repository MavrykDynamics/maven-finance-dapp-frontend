import TokensProvider from './tokens.provider'

import { TokenType } from 'utils/TypesAndInterfaces/General'
import { normalizeTokenPrices } from './helpers/tokens.normalizer'

export type TokenAddressType = string

// regular token
export interface TokenMetadataType {
  id: number
  address: TokenAddressType
  name: string
  symbol: string
  decimals: number
  icon: string
  type: TokenType
  loanData?: {
    indexerName: string
    isProtectedCollateral?: boolean
  }
}

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
    isProtectedCollateral: boolean
  }
}

// mToken in user store type
export type UserMTokenType = {
  lendedAmount: number
  tokenAddress: TokenAddressType
  rewardIndex: number
  rewardsEarned: number
}

type TokensPricesType = ReturnType<typeof normalizeTokenPrices>

// Context types
export type TokensContext = {
  // 3 bottom fields updates from updateTokensMetadata
  collateralTokens: Array<TokenAddressType>
  mTokens: Array<TokenAddressType>
  tokensMetadata: Record<TokenAddressType, TokenMetadataType>
  updateTokensMetadata: InstanceType<typeof TokensProvider>['updateTokensMetadata']

  tokensPrices: TokensPricesType
  updateTokensPrices: InstanceType<typeof TokensProvider>['updateTokensPrices']
}

export type State = {
  context: TokensContext
}

export type Props = {
  children: React.ReactNode
}
