import { M_Token } from './../utils/generated/graphqlTypes'
import { Governance_Financial_Whitelist_Token_Contract } from 'utils/generated/graphqlTypes'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import {
  GET_DIP_DUP_TOKENS,
  GET_MVK_FAUCET,
  GET_M_TOKENS,
  GET_TOKENS_PRICES,
  GET_WHITELIST_TOKENS,
} from './actions/dipDupActions.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { GET_AVALIABLE_COLLATERALS, GET_XTZ_BAKERS } from 'pages/Loans/Actions/getLoansData.actions'
import { XtzBakerType } from 'utils/TypesAndInterfaces/Loans'

export type TokensType = {
  dipDupTokens: Array<DipDupTokensGraphQl>
  dipDupContracts: Array<DipDupTokensGraphQl>
  tokensPrices: Record<string, number>
  avaliableCollaterals: Array<AvaliableCollateralType>
  xtzBakers: {
    otherBakers: Array<XtzBakerType>
    dao: (XtzBakerType & { description: string; isDisabled: boolean }) | null
    mavrykDynamics: (XtzBakerType & { description: string; isDisabled: boolean }) | null
  }
  whitelistTokens: Array<Governance_Financial_Whitelist_Token_Contract>
  mTokens: Array<M_Token>
  mvkFaucetAddress: string | null
}
const defaultTokensInfoState: TokensType = {
  dipDupTokens: [],
  dipDupContracts: [],
  whitelistTokens: [],
  avaliableCollaterals: [],
  xtzBakers: {
    otherBakers: [],
    dao: null,
    mavrykDynamics: null,
  },
  tokensPrices: { mvk: 1 },
  mTokens: [],
  mvkFaucetAddress: null,
}

export function tokens(state = defaultTokensInfoState, action: Action) {
  switch (action.type) {
    case GET_DIP_DUP_TOKENS:
      return { ...state, dipDupTokens: action.dipDupTokens, dipDupContracts: action.dipDupContracts }
    case GET_WHITELIST_TOKENS:
      return { ...state, whitelistTokens: action.whitelistTokens }
    case GET_AVALIABLE_COLLATERALS:
      return { ...state, avaliableCollaterals: action.avaliableCollaterals }
    case GET_XTZ_BAKERS:
      return { ...state, xtzBakers: action.xtzBakers }
    case GET_M_TOKENS:
      return { ...state, mTokens: action.mTokens }
    case GET_MVK_FAUCET:
      return { ...state, mvkFaucetAddress: action.mvkFaucet }
    case GET_TOKENS_PRICES:
      return {
        ...state,
        tokensPrices: { ...state.tokensPrices, ...action.tokensPrices },
      }
    default:
      return state
  }
}
