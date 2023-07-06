import React, { useCallback, useContext, useMemo, useState } from 'react'

// consts
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_ADDRESS } from 'utils/constants'

// helpers
import { normalizeTokenPrices, normalizeTokensMetadata } from './helpers/tokens.normalizer'

// types
import { TokensContext, TokensContextState } from './tokens.provider.types'
import { SubsribeOracleDataFeedSubscription, TokensMetadataSubscription } from 'utils/__generated__/graphql'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_TOKENS_METADATA } from './queries/tokens.query'

export const tokensContext = React.createContext<TokensContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const TokensProvider = ({ children }: Props) => {
  const [tokensCtxState, setTokensCtxState] = useState<TokensContextState>({
    collateralTokens: [],
    mTokens: [],
    tokensMetadata: {},
    tokensPrices: { [MVK_TOKEN_SYMBOL]: 1, [SMVK_TOKEN_ADDRESS]: 1 },
  })

  const { loading: tokensLoading } = useSubscription(SUBSCRIBE_TOKENS_METADATA, {
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
      updateTokensMetadata(data.token)
    },
    onError: (error) => console.log({ error }),
  })

  const updateTokensPrices = useCallback((feedsLedger: SubsribeOracleDataFeedSubscription['aggregator']) => {
    const normalizedTokenPrices = normalizeTokenPrices(feedsLedger)

    setTokensCtxState((prev) => ({
      ...prev,
      tokensPrices: { ...prev.tokensPrices, ...normalizedTokenPrices },
    }))
  }, [])

  const updateTokensMetadata = (tokensGql: TokensMetadataSubscription['token']) => {
    const tokensMetadata = normalizeTokensMetadata(tokensGql)

    setTokensCtxState({
      ...tokensCtxState,
      tokensMetadata: { ...tokensCtxState.tokensMetadata, ...tokensMetadata.tokensMetadata },
      collateralTokens: [...tokensCtxState.collateralTokens, ...tokensMetadata.collateralTokens],
      mTokens: [...tokensCtxState.mTokens, ...tokensMetadata.mTokens],
    })
  }

  const providerValue = useMemo(() => {
    return {
      ...tokensCtxState,
      updateTokensPrices,
      isLoading: tokensLoading,
    }
  }, [tokensCtxState, updateTokensPrices])

  return <tokensContext.Provider value={providerValue}>{children}</tokensContext.Provider>
}

export const useTokensContext = () => {
  const context = useContext(tokensContext)

  if (!context) {
    throw new Error('tokensContext should be used withing TokensProvider')
  }

  return context
}

export default TokensProvider
