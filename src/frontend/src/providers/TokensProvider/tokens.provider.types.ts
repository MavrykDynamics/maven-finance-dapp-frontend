import TokensProvider from './tokens.provider'

import { TokenType } from 'utils/TypesAndInterfaces/General'
import { normalizeTokenPrices } from './hooks/tokens.normalizer'

export type WhiteListTokensType = Array<{
  symbol: string
  address: string
  shortSymbol: TokenType
  id: number
}>

// Tokens Types
export type TokenAddress = string
export type TokenMetadata = {
  address: TokenAddress
  name: string
  symbol: string
  decimals: number
  icon: string
  type: TokenType
}

type TokensPricesType = ReturnType<typeof normalizeTokenPrices>

// Context types
export type TokensContext = {
  // 3 bottom fields updates from updateTokensMetadata
  collateralTokens: Array<TokenAddress>
  mTokens: Array<TokenAddress>
  tokensMetadata: Record<TokenAddress, TokenMetadata>
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
