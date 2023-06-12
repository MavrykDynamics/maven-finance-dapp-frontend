import TokensProvider from './tokens.provider'

import { TokenType } from 'utils/TypesAndInterfaces/General'
import { normalizeTokenPrices } from './helpers/tokens.normalizer'

export type WhiteListTokensType = Array<{
  symbol: string
  address: string
  shortSymbol: TokenType
  id: number
}>

// TODO: udpate tokens types with utility types
// Tokens Types
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
  loanData?: {
    indexerName: string
    isProtectedCollateral?: boolean
  }
}

// loan token (market)
export type LoansTokenMetadataType = WithRequiredProperty<TokenMetadataType, 'loanData'>
// collareral token
export type LoansCollateralTokenMetadataType = LoansTokenMetadataType & {
  loanData: {
    indexerName: string
    isProtectedCollateral: boolean
  }
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
