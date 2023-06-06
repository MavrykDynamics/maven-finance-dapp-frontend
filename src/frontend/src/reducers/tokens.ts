import { M_Token } from './../utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import { GET_DAPP_TOKENS } from './actions/getTokens.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { AnyAction } from 'redux'

export type TokensType = {
  dipDupTokens: Array<DipDupTokensGraphQl>
  tokensPrices: Record<string, number>
  avaliableCollaterals: Array<AvaliableCollateralType>
  mTokens: Array<M_Token>
}
const defaultTokensInfoState: TokensType = {
  dipDupTokens: [],
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
        mTokens: action.mTokens,
      }
    default:
      return state
  }
}
