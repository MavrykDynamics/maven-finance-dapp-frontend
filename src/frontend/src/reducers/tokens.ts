import { M_Token } from './../utils/generated/graphqlTypes'
import { ContractMetadataType, DipDupTokenDataType, TokenMetadataType } from 'utils/TypesAndInterfaces/DipDupTokens'
import { GET_DAPP_TOKENS, GET_MVK_FAUCET, GET_TOKENS_PRICES } from './actions/getTokens.actions'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { GET_AVALIABLE_COLLATERALS, GET_XTZ_BAKERS } from 'pages/Loans/Actions/getLoansData.actions'
import { XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { AnyAction } from 'redux'

export type TokensType = {
  dipDupMapper: Record<string, DipDupTokenDataType>

  contractsMetadata: Record<string, ContractMetadataType>
  tokensMetadata: Record<string, TokenMetadataType>

  tokensPrices: Record<string, number>
  avaliableCollaterals: Array<AvaliableCollateralType>
  xtzBakers: {
    otherBakers: Array<XtzBakerType>
    dao: (XtzBakerType & { description: string; isDisabled: boolean }) | null
    mavrykDynamics: (XtzBakerType & { description: string; isDisabled: boolean }) | null
  }
  whitelistTokens: Array<{
    symbol: string
    address: string
    shortSymbol: TokenType
    id: number
  }>
  mTokens: Array<M_Token>
  mvkFaucetAddress: string | null
}
const defaultTokensInfoState: TokensType = {
  dipDupMapper: {},

  contractsMetadata: {},
  tokensMetadata: {},
  whitelistTokens: [
    {
      symbol: 'xtz',
      address: 'KT1XYiqkAE2BtSeujKsiHBuRAAt3kmeuK4pP',
      shortSymbol: 'tez',
      id: 0,
    },
  ],
  avaliableCollaterals: [],
  xtzBakers: {
    otherBakers: [],
    dao: null,
    mavrykDynamics: null,
  },
  tokensPrices: { mvk: 1 },
  mTokens: [],
  // TODO: set default address to null, when contracts are updated
  mvkFaucetAddress: 'KT1A6EJRMuz8TZWeSxaqvU2UsqxRjopvo8Nh', //null,
}

export function tokens(state = defaultTokensInfoState, action: AnyAction) {
  switch (action.type) {
    case GET_DAPP_TOKENS:
      return {
        ...state,
        dipDupMapper: action.dipDupMapper,
        contractsMetadata: action.contractsMetadata,
        tokensMetadata: action.tokensMetadata,
        whitelistTokens: state.whitelistTokens.concat(action.whitelistTokens),
        mTokens: action.mTokens,
      }

    case GET_AVALIABLE_COLLATERALS:
      return { ...state, avaliableCollaterals: action.avaliableCollaterals }
    case GET_XTZ_BAKERS:
      return { ...state, xtzBakers: action.xtzBakers }
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
