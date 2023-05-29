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
