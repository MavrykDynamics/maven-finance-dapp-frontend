import { useQuery } from '@apollo/client'
import { GET_ORACLE_STORAGE_QUERY } from 'gql/queries'
import { useEffect } from 'react'
import { useDataFeedsContext } from '../dataFeeds.provider'

export const useDataFeedsInit = () => {
  const { initializeDataFeeds } = useDataFeedsContext()
  const { data: feedsData, loading: feedsLoading } = useQuery(GET_ORACLE_STORAGE_QUERY)

  useEffect(() => {
    if (!feedsLoading && feedsData) {
      initializeDataFeeds(feedsData)
    }
  }, [feedsLoading])
}
