import { useState } from 'react'
import { useSubscription } from '@apollo/client'

import { SATELLITE_VOTES_SUBSCRIPTION } from '../queries/satelliteVotes.query'
import { normalizeSatelliteVotings } from '../helpers/satellites.normalizer'
import { SatelliteVotesType } from '../satellites.provider.types'

export const useSatelliteVotes = (userAddress: string) => {
  const [satelliteVotes, setSatelliteVotes] = useState<SatelliteVotesType>({
    satelliteActionVotes: [],
    financialRequestsVotes: [],
    proposalsVotes: [],
  })

  const { loading: isSatelliteVotesLoading } = useSubscription(SATELLITE_VOTES_SUBSCRIPTION, {
    variables: { userAddress },
    onData: ({ data: { data } }) => {
      if (!data || !data.satellite[0]) return

      const normalizedVotes = normalizeSatelliteVotings(data.satellite[0].user)
      setSatelliteVotes(normalizedVotes)
    },
    shouldResubscribe: true,
  })

  return {
    satelliteVotes,
    isLoading: isSatelliteVotesLoading,
  }
}
