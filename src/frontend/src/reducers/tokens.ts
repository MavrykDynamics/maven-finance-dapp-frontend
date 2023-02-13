import { M_Token } from './../utils/generated/graphqlTypes'
import { Governance_Financial_Whitelist_Token_Contract } from 'utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import {
  GET_DIP_DUP_TOKENS,
  GET_M_TOKENS,
  GET_TOKENS_PRICES,
  GET_WHITELIST_TOKENS,
} from './actions/dipDupActions.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { GET_AVALIABLE_COLLATERALS } from 'pages/Loans/Actions/getLoansData.actions'

export type TokensType = {
  dipDupTokens: Array<DipDupTokensGraphQl>
  dipDupContracts: Array<DipDupTokensGraphQl>
  tokensPrices: Record<string, { usd: number }>
  avaliableCollaterals: Array<AvaliableCollateralType>
  whitelistTokens: Array<Governance_Financial_Whitelist_Token_Contract>
  mTokens: Array<M_Token>
}
const defaultTokensInfoState: TokensType = {
  dipDupTokens: [],
  dipDupContracts: [],
  whitelistTokens: [],
  avaliableCollaterals: [],
  tokensPrices: { mvk: { usd: 0.25 } },
  mTokens: [],
}

export function tokens(state = defaultTokensInfoState, action: Action) {
  switch (action.type) {
    case GET_DIP_DUP_TOKENS:
      return { ...state, dipDupTokens: action.dipDupTokens, dipDupContracts: action.dipDupContracts }
    case GET_WHITELIST_TOKENS:
      return { ...state, whitelistTokens: action.whitelistTokens }
    case GET_AVALIABLE_COLLATERALS:
      return { ...state, avaliableCollaterals: action.avaliableCollaterals }
    case GET_M_TOKENS:
      return { ...state, mTokens: action.mTokens }
    case GET_TOKENS_PRICES:
      return {
        ...state,
        tokensPrices: { ...state.tokensPrices, ...action.tokensPrices },
      }
    default:
      return state
  }
}
