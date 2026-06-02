import { useState } from 'react'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// consts
import { SATELLITE_VOTES_QUERY } from '../queries/satelliteVotes.query'
import { normalizeSatelliteVotes } from '../helpers/satellites.normalizer'

// types
import { SatelliteVotesType } from '../satellites.provider.types'

export const useSatelliteVotes = (userAddress: string) => {
  const { handleQueryError } = useQueryProvider()

  const [satelliteVotes, setSatelliteVotes] = useState<SatelliteVotesType>({
    satelliteActionVotes: [],
    financialRequestsVotes: [],
    proposalsVotes: [],
  })

  const { isLoading: isSatelliteVotesLoading } = useGraphQLQuery(SATELLITE_VOTES_QUERY, {
    variables: { userAddress },
    onCompleted: (data) => {
      if (!data.satellite[0]) return

      const normalizedVotes = normalizeSatelliteVotes(data.satellite[0].user)
      setSatelliteVotes(normalizedVotes)
    },
    onError: (error) => handleQueryError(error, 'SATELLITE_VOTES_QUERY'),
  })

  return {
    satelliteVotes,
    isLoading: isSatelliteVotesLoading,
  }
}
