import { fetchGraphQLData } from 'providers/QueryProvider/useGraphQLQuery'
import { SATELLITE_ADDITIONAL_DATA } from '../queries/satellites.query'
import { SatelliteAdditionalDataQueryQuery } from 'utils/__generated__/graphql'

export async function fetchAdditionalSatelliteData(addresses: string[]) {
  if (!addresses.length) return []

  const data = await fetchGraphQLData<SatelliteAdditionalDataQueryQuery>(SATELLITE_ADDITIONAL_DATA, {
    satelliteAdditionalWhere: {
      user: {
        address: {
          _in: addresses,
        },
      },
    },
  })

  return data.satelliteAdditionalData
}
