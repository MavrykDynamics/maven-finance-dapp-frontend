import { M_Token, Token } from './../utils/generated/graphqlTypes'
import { GET_DAPP_TOKENS } from './actions/getTokens.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
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
