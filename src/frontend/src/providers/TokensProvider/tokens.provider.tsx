import React, { useContext, useMemo, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'

// consts
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { QUERY_TOKENS_METADATA } from './queries/tokens.query'

// helpers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useQueryRefetch } from 'providers/common/hooks/useQueryRefetch'
import { normalizeTokenPrices, normalizeTokensMetadata } from './helpers/tokens.normalizer'

// types
import { TokensContext, TokensContextState } from './tokens.provider.types'
import { FullFeedsQueryType, SmallFeedsQueryType } from 'providers/DataFeedsProvider/helpers/feeds.schemes'
import { TokensGqlSchemaType, tokensGqlSchema } from './helpers/tokens.schemes'

export const tokensContext = React.createContext<TokensContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// TODO: add nullable values and handle initial loading by null values
export const TokensProvider = ({ children }: Props) => {
  const { currentIndexedLevel } = useDappConfigContext()

  const initialLoadingStatus = useRef(true)

  const [lastUpdatedBlock, setLastUpdatedBlock] = useState(currentIndexedLevel)

  const [tokensCtxState, setTokensCtxState] = useState<TokensContextState>({
    collateralTokens: [],
    mTokens: [],
    tokensMetadata: {},
    tokensPrices: { [MVK_TOKEN_SYMBOL]: 1, [SMVK_TOKEN_ADDRESS]: 1 },
  })

  // Load tokens metadata
  const { refetch: refetchTokens } = useQuery(QUERY_TOKENS_METADATA, {
    onCompleted: (data) => {
      try {
        const parsedTokens = tokensGqlSchema.parse(data.token)

        initialLoadingStatus.current = false

        updateTokensMetadata(parsedTokens)
      } catch (e) {
        console.error('zod parsing tokens error:', { e })
      }
    },
    onError: (error) => console.log({ error }),
  })

  const refetchQueryHookArgs = useMemo(
    () => ({
      refetchers: [
        {
          refetch: refetchTokens,
          options: {
            blocksDiff: 20,
            lastUpdatedBlock,
            updateLastUpdatedLvl: (updateLevel: number) => setLastUpdatedBlock(updateLevel),
          },
        },
      ],
    }),
    [refetchTokens, lastUpdatedBlock],
  )

  useQueryRefetch(refetchQueryHookArgs)

  // update token prices in ctx
  const updateTokensPrices = (feedsLedger: FullFeedsQueryType | SmallFeedsQueryType) => {
    const normalizedTokenPrices = normalizeTokenPrices(feedsLedger)

    setTokensCtxState((prev) => ({
      ...prev,
      tokensPrices: { ...prev.tokensPrices, ...normalizedTokenPrices },
    }))
  }

  // update tokens metadata in ctx
  const updateTokensMetadata = (tokensGql: TokensGqlSchemaType) => {
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
