import TokensProvider from './tokens.provider'

import { M_Token } from 'utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

export type XtxBakersType = {
  otherBakers: Array<XtzBakerType>
  dao: (XtzBakerType & { description: string; isDisabled: boolean }) | null
  mavrykDynamics: (XtzBakerType & { description: string; isDisabled: boolean }) | null
}

export type WhiteListTokensType = Array<{
  symbol: string
  address: string
  shortSymbol: TokenType
  id: number
}>

export type TokensContext = {
  dipDupTokens: Array<DipDupTokensGraphQl>
  dipDupContracts: Array<DipDupTokensGraphQl>
  tokensPrices: Record<string, number>
  avaliableCollaterals: Array<AvaliableCollateralType>
  xtzBakers: XtxBakersType
  whitelistTokens: WhiteListTokensType
  mTokens: Array<M_Token>
  mvkFaucetAddress: string | null
  // actions
  initializeDAPPTokens: InstanceType<typeof TokensProvider>['initializeDAPPTokens']
  updateMVKFaucetAddress: InstanceType<typeof TokensProvider>['updateMVKFaucetAddress']
  selfUpdateXtzBakers: InstanceType<typeof TokensProvider>['selfUpdateXtzBakers']
}

export type State = {
  context: TokensContext
}

export type Props = {
  children: React.ReactNode
  feedsLedger: Feed[]
}
