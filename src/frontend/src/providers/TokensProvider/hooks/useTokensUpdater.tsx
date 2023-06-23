import { useSubscription } from '@apollo/client'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// subs
import { useEffect, useState } from 'react'
import { SUB_SUBSCRIBE, SUB_SKIP, SUB_QUERY } from 'utils/api/apollo.consts'
import { TokensSubscriptionSkipsType } from '../helpers/tokens.types'
import { SUBSCRIBE_TOKENS_METADATA } from '../queries/tokens.query'

export const useTokensUpdater = (
  { skipTokensMetadataSubscription }: TokensSubscriptionSkipsType = { skipTokensMetadataSubscription: SUB_SUBSCRIBE },
) => {
  const { updateTokensMetadata } = useTokensContext()

  const [shouldSkip, setShouldSkip] = useState<TokensSubscriptionSkipsType>({ skipTokensMetadataSubscription })

  const { loading: tokensLoading } = useSubscription(SUBSCRIBE_TOKENS_METADATA, {
    skip: shouldSkip.skipTokensMetadataSubscription === SUB_SKIP,
    shouldResubscribe: true,
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        updateTokensMetadata(data.token)
      }
    },
    onError: (error) => {
      console.log({ error })
    },
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!tokensLoading && skipTokensMetadataSubscription === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipTokensMetadataSubscription: SUB_SKIP,
      }))
    }
  }, [skipTokensMetadataSubscription, tokensLoading])

  return { isLoading: tokensLoading }
}
