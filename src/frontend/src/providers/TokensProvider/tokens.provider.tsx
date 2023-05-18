import React, { useContext } from 'react'

// context
import { dataFeedsContext } from '../DataFeedsProvider/dataFeeds.provider'

// utils
import {
  normalizeDipDupTokens,
  normalizeDipDupContracts,
  normalizeMTokens,
  normalizeWhitelistTokens,
} from 'utils/normalizers/DAPPTokens.normalizers'
import { getSymbolAndNameFromFeedName } from 'utils/parse'
import { convertNumberForClient } from 'utils/calcFunctions'

// types
import { State, Props, TokensContext } from './tokens.provider.types'
import { DappTokensQuery, Dipdup_Token_Metadata, MvkFaucetQuery } from 'utils/__generated__/graphql'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

export const tokensContext = React.createContext<TokensContext>(undefined!)

export class TokensProvider extends React.Component<Props, State> {
  static contextType = dataFeedsContext

  feedsContext!: React.ContextType<typeof dataFeedsContext>

  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        dipDupTokens: [],
        dipDupContracts: [],
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
        // actions
        initializeDAPPTokens: this.initializeDAPPTokens,
        updateMVKFaucetAddress: this.updateMVKFaucetAddress,
      },
    }
  }

  initializeDAPPTokens = (dappTokensData: DappTokensQuery) => {
    const dipDupTokensStorage = dappTokensData.dipdup_token_metadata
    const dipDupContractsStorage = dappTokensData.dipdup_contract_metadata
    const whitelistTokensStorage = dappTokensData.treasury
    const mTokensStorage = dappTokensData.m_token

    // TODO remove any after removing redux logic
    const dipDupTokens = normalizeDipDupTokens(dipDupTokensStorage as any) as Dipdup_Token_Metadata[]
    const dipDupContracts = normalizeDipDupContracts(dipDupContractsStorage as any) as Dipdup_Token_Metadata[]
    const mTokens = normalizeMTokens(mTokensStorage as any) as any
    const whitelistTokens = normalizeWhitelistTokens(whitelistTokensStorage as any) as any

    this.setState({
      context: {
        ...this.state.context,
        dipDupTokens,
        dipDupContracts,
        whitelistTokens: this.state.context.whitelistTokens.concat(whitelistTokens),
        mTokens,
      },
    })
  }

  updateMVKFaucetAddress = (mvkData: MvkFaucetQuery) => {
    const address = mvkData.mvk_faucet[0]?.address ?? null

    this.setState({
      context: {
        ...this.state.context,
        mvkFaucetAddress: address,
      },
    })
  }

  updateTokenPrices = (feedsLedger: Feed[]) => {
    const tokenPricesFromFeeds = feedsLedger.reduce(
      (acc: Record<string, number>, { name, last_completed_data, decimals }) => {
        const assetSymbol = getSymbolAndNameFromFeedName(name).symbol
        const rate = convertNumberForClient({ number: last_completed_data, grade: decimals })
        acc[assetSymbol] = rate
        return acc
      },
      {},
    )

    this.setState({
      context: {
        ...this.state.context,
        tokensPrices: tokenPricesFromFeeds,
      },
    })
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.feedsLedger !== this.props.feedsLedger) {
      this.updateTokenPrices(this.props.feedsLedger)
    }
  }

  //   case GET_AVALIABLE_COLLATERALS:
  //     return { ...state, avaliableCollaterals: action.avaliableCollaterals }
  //   case GET_XTZ_BAKERS:
  //     return { ...state, xtzBakers: action.xtzBakers }

  render(): React.ReactNode {
    return <tokensContext.Provider value={this.state.context}>{this.props.children}</tokensContext.Provider>
  }
}

export const useTokensContext = () => {
  const context = useContext(tokensContext)

  if (!context) {
    throw new Error('tokensContext should be used withing Tokens provider')
  }

  return context
}

export default TokensProvider
