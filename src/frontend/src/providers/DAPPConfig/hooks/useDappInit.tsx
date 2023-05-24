import { useEffect } from 'react'
import { useDAPPConfigContext } from '../dappConfig.provider'
import { useQuery } from '@apollo/client'
import { GET_MAX_LENGTHS_QUERY, GET_MVK_FAUCET_QUERY } from 'gql/queries'

export const useDappInit = () => {
  const { updateMaxLengths, updateMVKFaucetAddress, updateXtzBakers, xtzBakers } = useDAPPConfigContext()

  const { data: maxLengthsData, loading: maxLengthsLoading } = useQuery(GET_MAX_LENGTHS_QUERY)

  const { data: mvkData, loading: mvkLoading } = useQuery(GET_MVK_FAUCET_QUERY)

  useEffect(() => {
    if (!maxLengthsLoading && maxLengthsData) {
      updateMaxLengths(maxLengthsData)
    }
  }, [maxLengthsLoading])

  useEffect(() => {
    if (!mvkLoading && mvkData) {
      updateMVKFaucetAddress(mvkData)
    }
  }, [mvkLoading])

  useEffect(() => {
    if (!xtzBakers) {
      updateXtzBakers()
    }
  }, [])
}
