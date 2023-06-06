import { M_Token } from './../utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import { GET_DAPP_TOKENS } from './actions/getTokens.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { AnyAction } from 'redux'

export type TokensType = {
  dipDupTokens: Array<DipDupTokensGraphQl>
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
    default:
      return state
  }
}
