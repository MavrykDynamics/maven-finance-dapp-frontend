import { useState } from 'react'
import { ApolloError } from '@apollo/client'

import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

import { SATELLITE_VOTES_QUERY } from '../queries/satelliteVotes.query'
import { normalizeSatelliteVotings } from '../helpers/satellites.normalizer'

import { SatelliteVotesType } from '../satellites.provider.types'

export const useSatelliteVotes = (userAddress: string) => {
  const [satelliteVotes, setSatelliteVotes] = useState<SatelliteVotesType>({
    satelliteActionVotes: [],
    financialRequestsVotes: [],
    proposalsVotes: [],
  })

  const { loading: isSatelliteVotesLoading } = useQueryWithRefetch(SATELLITE_VOTES_QUERY, {
    variables: { userAddress },
    onCompleted: (data) => {
      if (!data.satellite[0]) return

      const normalizedVotes = normalizeSatelliteVotings(data.satellite[0].user)
      setSatelliteVotes(normalizedVotes)
    },
    onError: (e: ApolloError) => console.error('SATELLITE_VOTES_QUERY query error:', { e }),
  })

  return {
    satelliteVotes,
    isLoading: isSatelliteVotesLoading,
  }
}
