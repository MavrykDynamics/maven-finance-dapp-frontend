import { useEffect, useState, useRef } from 'react'
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

// TODO add checks if data is empty (valid data with zod) and handle errors for it
export const useDataFeedDetailsUpdater = (feedId: string) => {
  const [feedsData, setFeedsData] = useState<Partial<GetOracleDataFeedsQuery>>({})
  const [forcedUpdate, setForcedUpdate] = useState(false)
  const { initializeDataFeeds } = useDataFeedsContext()
  const initialDataStorageRef = useRef<GetOracleDataFeedsQuery | null>(null)

  useEffect(() => {
    if (
      forcedUpdate ||
      (feedsData.hasOwnProperty('aggregator') &&
        feedsData.hasOwnProperty('aggregator_factory') &&
        feedsData.hasOwnProperty('dipdup_contract_metadata'))
    ) {
      if (initialDataStorageRef.current === null) {
        initialDataStorageRef.current = feedsData as GetOracleDataFeedsQuery
      }

      const _data = { ...feedsData }

      if (!_data.hasOwnProperty('aggregator_factory')) {
        _data.aggregator_factory = { ...initialDataStorageRef.current.aggregator_factory }
      }

      if (!_data.hasOwnProperty('dipdup_contract_metadata')) {
        _data.dipdup_contract_metadata = { ...initialDataStorageRef.current.dipdup_contract_metadata }
      }

      initializeDataFeeds(_data as GetOracleDataFeedsQuery, true)
      setFeedsData({})
      setForcedUpdate(false)
    }
  }, [forcedUpdate, feedsData, initializeDataFeeds])

  //   like heartbeat (default 10 seconds if there is a data)
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (
      feedsData.hasOwnProperty('aggregator') &&
      feedsData.hasOwnProperty('aggregator_factory') &&
      feedsData.hasOwnProperty('dipdup_contract_metadata')
    ) {
      timeout = setTimeout(() => {
        setForcedUpdate(true)
      }, 10000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [feedsData])

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

  const { loading: dipdupContractsMetadataLoading } = useSubscription(
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

  return { isLoading: !dipdupContractsMetadataLoading && !aggregatorFactoryLoading && !aggregatorLoading }
}
