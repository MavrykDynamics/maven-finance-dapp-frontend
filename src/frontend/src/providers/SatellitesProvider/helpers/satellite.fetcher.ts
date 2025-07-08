import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { SATELLITE_ADDITIONAL_DATA } from '../queries/satellites.query'

export async function fetchAdditionalSatelliteData(addresses: string[], client: ApolloClient<NormalizedCacheObject>) {
  if (!addresses.length) return []

  const { data } = await client.query({
    query: SATELLITE_ADDITIONAL_DATA,
    variables: {
      satelliteAdditionalWhere: {
        user: {
          address: {
            _in: addresses,
          },
        },
      },
    },
    fetchPolicy: 'network-only',
  })

  return data.satelliteAdditionalData
}
