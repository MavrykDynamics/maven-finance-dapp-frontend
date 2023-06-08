import { M_Token, Token } from './../utils/generated/graphqlTypes'
import { GET_DAPP_TOKENS } from './actions/getTokens.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { GET_AVALIABLE_COLLATERALS } from 'pages/Loans/Actions/getLoansData.actions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { AnyAction } from 'redux'

export type TokenMetadataType = {
  decimals: string
  name?: string
  symbol: string
  icon?: string
}

export type TokensType = {
  dipDupTokens: Array<Token & { metadata: TokenMetadataType }>
  tokensPrices: Record<string, number>
  avaliableCollaterals: Array<AvaliableCollateralType>
  whitelistTokens: Array<{
    symbol: string
    address: string
    shortSymbol: TokenType
    id: number
  }>
  mTokens: Array<M_Token>
}
const defaultTokensInfoState: TokensType = {
  dipDupTokens: [],
  whitelistTokens: [
    {
      symbol: 'xtz',
      address: 'KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP',
      shortSymbol: 'tez',
      id: 0,
    },
  ],
  avaliableCollaterals: [],
  tokensPrices: { mvk: 1 },
  mTokens: [],
}

export function tokens(state = defaultTokensInfoState, action: AnyAction) {
  switch (action.type) {
    case GET_DAPP_TOKENS:
      return {
        ...state,
        dipDupTokens: action.dipDupTokens,
        whitelistTokens: state.whitelistTokens.concat(action.whitelistTokens),
        mTokens: action.mTokens,
      }
    case GET_AVALIABLE_COLLATERALS:
      return { ...state, avaliableCollaterals: action.avaliableCollaterals }
    default:
      return state
  }
}
