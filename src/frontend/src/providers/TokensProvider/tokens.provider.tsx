import React, { useContext } from 'react'

// context
import { dataFeedsContext } from '../DataFeedsProvider/dataFeeds.provider'

// utils

// helpers
import { normalizeTokenPrices } from './hooks/tokens.normalizer'

// types
import { State, Props, TokensContext } from './tokens.provider.types'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'

export const tokensContext = React.createContext<TokensContext>(undefined!)

export class TokensProvider extends React.Component<Props, State> {
  static contextType = dataFeedsContext

  feedsContext!: React.ContextType<typeof dataFeedsContext>

  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        tokensPrices: { [MVK_TOKEN_SYMBOL]: 1, [SMVK_TOKEN_SYMBOL]: 1 },
        updateTokensPrices: this.updateTokensPrices,
      },
    }
  }

  updateTokensPrices = (feedsLedger: SubsribeOracleDataFeedSubscription['aggregator']) => {
    const normalizedTokenPrices = normalizeTokenPrices(feedsLedger)

    this.setState({
      context: {
        ...this.state.context,
        tokensPrices: { ...this.state.context.tokensPrices, ...normalizedTokenPrices },
      },
    })
  }

  // initializeDAPPTokens = (dappTokensData: DappTokensQuery) => {
  //   const dipDupTokensStorage = dappTokensData.dipdup_token_metadata
  //   const whitelistTokensStorage = dappTokensData.treasury
  //   const mTokensStorage = dappTokensData.m_token

  //   // TODO remove any after removing redux logic
  //   const dipDupTokens = normalizeDipDupTokens(dipDupTokensStorage as any) as Dipdup_Token_Metadata[]
  //   const mTokens = normalizeMTokens(mTokensStorage as any) as any
  //   const whitelistTokens = normalizeWhitelistTokens(whitelistTokensStorage as any) as any

  //   this.setState({
  //     context: {
  //       ...this.state.context,
  //       dipDupTokens,
  //       whitelistTokens: this.state.context.whitelistTokens.concat(whitelistTokens),
  //       mTokens,
  //     },
  //   })
  // }

  // updateCollateralsData = (collateralData: GetAvaliableCollateralsQuery) => {
  //   this.setState({
  //     context: {
  //       ...this.state.context,
  //       collateralData,
  //     },
  //   })
  // }

  // updateAvaliableCollaterals = () => {
  //   // TODO update typed after removing redux (remove -> as Array<Lending_Controller_Collateral_Token>)
  //   const avaliableCollaterals = getCollateralTokens(
  //     this.state.context.collateralData?.lending_controller?.[0]
  //       ?.collateral_tokens as Array<Lending_Controller_Collateral_Token>,
  //     this.state.context.dipDupTokens,
  //     this.props.feedsLedger,
  //   )

  //   this.setState({
  //     context: {
  //       ...this.state.context,
  //       avaliableCollaterals,
  //     },
  //   })
  // }

  // componentDidUpdate(prevProps: Readonly<Props>): void {
  //   if (prevProps.feedsLedger !== this.props.feedsLedger) {
  //     this.updateTokenPrices(this.props.feedsLedger)
  //   }

  //   // update collaterals when there is essential data for it
  //   if (
  //     this.props.feedsLedger.length > 0 &&
  //     this.state.context.dipDupTokens.length > 0 &&
  //     this.state.context.collateralData !== null &&
  //     this.state.context.avaliableCollaterals === null
  //   ) {
  //     this.updateAvaliableCollaterals()
  //   }
  // }

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
