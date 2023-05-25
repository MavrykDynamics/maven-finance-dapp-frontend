import TokensProvider from './tokens.provider'

import { M_Token } from 'utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { GetAvaliableCollateralsQuery } from 'utils/__generated__/graphql'
import { Feed } from 'providers/DataFeedsProvider/dataFeeds.provider.types'

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
  // data
  // dipDupTokens: Array<DipDupTokensGraphQl>
  tokensPrices: Record<string, number>
  // avaliableCollaterals: Array<AvaliableCollateralType> | null
  // whitelistTokens: WhiteListTokensType
  // mTokens: Array<M_Token>
  // internal helper state
  // collateralData: GetAvaliableCollateralsQuery | null
  // actions
  // initializeDAPPTokens: InstanceType<typeof TokensProvider>['initializeDAPPTokens']
  // updateCollateralsData: InstanceType<typeof TokensProvider>['updateCollateralsData']
  // updateAvaliableCollaterals: InstanceType<typeof TokensProvider>['updateAvaliableCollaterals']
  updateTokensPrices: InstanceType<typeof TokensProvider>['updateTokensPrices']
}

export type State = {
  context: TokensContext
}

export type Props = {
  children: React.ReactNode
}
