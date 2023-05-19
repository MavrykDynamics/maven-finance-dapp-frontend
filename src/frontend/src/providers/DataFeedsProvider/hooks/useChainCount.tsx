import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_CHAIN_POINTS_COUNT } from 'gql/queries'

export const useChainCount = () => {
  const { data: chainPointsData } = useSubscription(SUBSCRIBE_CHAIN_POINTS_COUNT, {
    fetchPolicy: 'network-only',
  })
  const dataPointsCount = chainPointsData ? chainPointsData.aggregator_aggregate.aggregate?.count ?? 0 : 0

  return { dataPointsCount }
}
