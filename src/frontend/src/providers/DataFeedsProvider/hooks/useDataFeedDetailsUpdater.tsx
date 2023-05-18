import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'

// providers
import { useDataFeedsContext } from '../dataFeeds.provider'

// subs
import {
  SUBSCRIBE_ORACLE_DETAILS_AGGREGATOR,
  SUBSCRIBTION_ORACLE_STORAGE_AGGREGATOR_FACTORY,
  SUBSCRIBTION_ORACLE_STORAGE_DIPDUP_CONTRACT_METADATA,
} from 'gql/queries/getOracleStorage'
import { GetOracleDataFeedsQuery } from 'utils/__generated__/graphql'

export const useDataFeedDetailsUpdater = (feedId: string) => {
  const [feedsData, setFeedsData] = useState<Partial<GetOracleDataFeedsQuery>>({})
  const { initializeDataFeeds } = useDataFeedsContext()

  useEffect(() => {
    if (
      feedsData.hasOwnProperty('aggregator') &&
      feedsData.hasOwnProperty('aggregator_factory') &&
      feedsData.hasOwnProperty('dipdup_contract_metadata')
    ) {
      initializeDataFeeds(feedsData as GetOracleDataFeedsQuery, true)
      setFeedsData({})
    }
  }, [feedsData, initializeDataFeeds])

  const { loading: aggregatorLoading } = useSubscription(SUBSCRIBE_ORACLE_DETAILS_AGGREGATOR, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setFeedsData({ ...feedsData, aggregator: data.aggregator })
      }
    },
    variables: {
      address: feedId,
    },
    shouldResubscribe: true,
  })

  const { loading: aggregatorFactoryLoading } = useSubscription(SUBSCRIBTION_ORACLE_STORAGE_AGGREGATOR_FACTORY, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        setFeedsData({ ...feedsData, aggregator_factory: data.aggregator_factory })
      }
    },
  })

  const { loading: dipdeupContractsMetadataLoading } = useSubscription(
    SUBSCRIBTION_ORACLE_STORAGE_DIPDUP_CONTRACT_METADATA,
    {
      onData: ({ data: response }) => {
        const { data } = response
        if (data) {
          setFeedsData({ ...feedsData, dipdup_contract_metadata: data.dipdup_contract_metadata })
        }
      },
    },
  )

  return { isLoading: !dipdeupContractsMetadataLoading && !aggregatorFactoryLoading && !aggregatorLoading }
}
