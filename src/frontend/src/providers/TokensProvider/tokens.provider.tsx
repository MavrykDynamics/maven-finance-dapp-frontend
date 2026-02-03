import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'

// consts
import { MVN_TOKEN_SYMBOL, SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { QUERY_TOKENS_METADATA } from './queries/tokens.query'
import { tokensGqlSchema } from './helpers/tokens.schemes'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQueryOnce } from 'providers/QueryProvider/useGraphQLQuery'

// helpers
import { normalizeTokenPrices, normalizeTokensMetadata } from './helpers/tokens.normalizer'

// types
import { TokensContext, TokensContextStateType } from './tokens.provider.types'
import { FullFeedsQueryType, SmallFeedsQueryType } from 'providers/DataFeedsProvider/helpers/feeds.schemas'

export const tokensContext = React.createContext<TokensContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: handle itial loading with null init values
export const TokensProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()

  const initialLoadingStatus = useRef(true)

  const [tokensCtxState, setTokensCtxState] = useState<TokensContextStateType>({
    collateralTokens: [],
    mTokens: [],
    tokensMetadata: {},
    farmLpTokens: [],
    tokensPrices: { [MVN_TOKEN_SYMBOL]: 1, [SMVN_TOKEN_ADDRESS]: 1 },
  })

  // Load tokens metadata
  useGraphQLQueryOnce(QUERY_TOKENS_METADATA, {
    onCompleted: (data) => {
      try {
        const parsedTokens = tokensGqlSchema.parse(data.token)

        const { tokensMetadata, mTokens, farmLpTokens, collateralTokens } = normalizeTokensMetadata(parsedTokens)

        setTokensCtxState((prev) => ({
          ...prev,
          tokensMetadata,
          farmLpTokens,
          collateralTokens,
          mTokens,
        }))
      } catch (e) {
        console.error('zod parsing tokens error:', { e })
      } finally {
        initialLoadingStatus.current = false
      }
    },
    onError: (error) => {
      handleQueryError(error, 'QUERY_TOKENS_METADATA')
      initialLoadingStatus.current = false
    },
  })

  // update token prices in ctx
  const updateTokensPrices = useCallback((feedsLedger: FullFeedsQueryType | SmallFeedsQueryType) => {
    const normalizedTokenPrices = normalizeTokenPrices(feedsLedger)

    setTokensCtxState((prev) => ({
      ...prev,
      tokensPrices: { ...prev.tokensPrices, ...normalizedTokenPrices },
    }))
  }, [])

  const providerValue = useMemo(() => {
    return {
      updateTokensPrices,
      isLoading: initialLoadingStatus.current,
      ...tokensCtxState,
    }
  }, [tokensCtxState])

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
