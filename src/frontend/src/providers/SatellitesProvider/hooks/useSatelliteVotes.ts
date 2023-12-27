import { useState } from 'react'

// hooks
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// consts
import { SATELLITE_VOTES_QUERY } from '../queries/satelliteVotes.query'
import { normalizeSatelliteVotes } from '../helpers/satellites.normalizer'

// types
import { SatelliteVotesType } from '../satellites.provider.types'

export const useSatelliteVotes = (userAddress: string) => {
  const { handleApolloError } = useApolloContext()

  const [satelliteVotes, setSatelliteVotes] = useState<SatelliteVotesType>({
    satelliteActionVotes: [],
    financialRequestsVotes: [],
    proposalsVotes: [],
  })

  const { loading: isSatelliteVotesLoading } = useQueryWithRefetch(SATELLITE_VOTES_QUERY, {
    variables: { userAddress },
    onCompleted: (data) => {
      if (!data.satellite[0]) return

      const normalizedVotes = normalizeSatelliteVotes(data.satellite[0].user)
      setSatelliteVotes(normalizedVotes)
    },
    onError: (error) => handleApolloError(error, 'SATELLITE_VOTES_QUERY'),
  })

  return {
    satelliteVotes,
    isLoading: isSatelliteVotesLoading,
  }
}
