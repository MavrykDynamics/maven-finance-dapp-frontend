import React, { useContext } from 'react'

// consts
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'

// helpers
import { normalizeTokenPrices, normalizeTokensMetadata } from './hooks/tokens.normalizer'

// types
import { State, Props, TokensContext } from './tokens.provider.types'
import { SubsribeOracleDataFeedSubscription, TokensMetadataSubscription } from 'utils/__generated__/graphql'

export const tokensContext = React.createContext<TokensContext>(undefined!)

/** */
export class TokensProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        collateralTokens: [],
        mTokens: [],
        tokensMetadata: {},
        tokensPrices: { [MVK_TOKEN_SYMBOL]: 1, [SMVK_TOKEN_SYMBOL]: 1 },
        updateTokensPrices: this.updateTokensPrices,
        updateTokensMetadata: this.updateTokensMetadata,
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

  updateTokensMetadata = (tokensGql: TokensMetadataSubscription['token']) => {
    const tokensMetadata = normalizeTokensMetadata(tokensGql)

    // Logs for debugging, TODO: remove when tokens update is done
    // console.info('tokens from gql: ', JSON.stringify(tokensGql, null, '  '))
    // console.info('all tokens: ', JSON.stringify(tokensMetadata.tokensMetadata, null, '  '))
    // console.info('collateral tokens: ', JSON.stringify(tokensMetadata.collateralTokens, null, '  '))
    // console.info('mTokens: ', JSON.stringify(tokensMetadata.mTokens, null, '  '))

    this.setState({
      context: {
        ...this.state.context,
        tokensMetadata: { ...this.state.context.tokensMetadata, ...tokensMetadata.tokensMetadata },
        collateralTokens: { ...this.state.context.collateralTokens, ...tokensMetadata.collateralTokens },
        mTokens: { ...this.state.context.mTokens, ...tokensMetadata.mTokens },
      },
    })
  }

  /** */
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
