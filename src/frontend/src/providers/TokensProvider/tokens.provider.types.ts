import TokensProvider from './tokens.provider'

import { XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { normalizeTokenPrices } from './hooks/tokens.normalizer'

export type XtxBakersType = {
  otherBakers: Array<XtzBakerType>
  dao: (XtzBakerType & { description: string; isDisabled: boolean }) | null
  mavrykDynamics: (XtzBakerType & { description: string; isDisabled: boolean }) | null
}

type TokensPricesType = ReturnType<typeof normalizeTokenPrices>

export type WhiteListTokensType = Array<{
  symbol: string
  address: string
  shortSymbol: TokenType
  id: number
}>

export type TokensContext = {
  // TODO: implement later
  // data
  // dipDupTokens: Array<DipDupTokensGraphQl>
  // avaliableCollaterals: Array<AvaliableCollateralType> | null
  // whitelistTokens: WhiteListTokensType
  // mTokens: Array<M_Token>
  // internal helper state
  // collateralData: GetAvaliableCollateralsQuery | null
  // actions
  // initializeDAPPTokens: InstanceType<typeof TokensProvider>['initializeDAPPTokens']
  // updateCollateralsData: InstanceType<typeof TokensProvider>['updateCollateralsData']
  // updateAvaliableCollaterals: InstanceType<typeof TokensProvider>['updateAvaliableCollaterals']

  tokensPrices: TokensPricesType
  updateTokensPrices: InstanceType<typeof TokensProvider>['updateTokensPrices']
}

export type State = {
  context: TokensContext
}

export type Props = {
  children: React.ReactNode
}
