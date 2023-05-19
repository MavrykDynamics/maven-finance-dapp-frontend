import { useEffect } from 'react'
import { useDAPPConfigContext } from '../dappConfig.provider'
import { useQuery } from '@apollo/client'
import { GET_MAX_LENGTHS_QUERY } from 'gql/queries'

export const useDappInit = () => {
  const { initializeDappConfigData } = useDAPPConfigContext()

  const { data: maxLengthsData, loading: maxLengthsLoading } = useQuery(GET_MAX_LENGTHS_QUERY)

  useEffect(() => {
    if (!maxLengthsLoading && maxLengthsData) {
      initializeDappConfigData(maxLengthsData)
    }
  }, [maxLengthsLoading])
}
