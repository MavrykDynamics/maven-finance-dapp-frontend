import { useState } from 'react'
import { useSubscription } from '@apollo/client'

import { SATELLITE_TOTAL_VOTING_POWER_SUBSCRIPTION } from '../queries/satelliteTotalVotingPower.query'

export const useSatelliteTotalVotingPower = (satelliteAddress: string) => {
  const [satelliteTotalVotingPower, setSatelliteTotalVotingPower] = useState(0)

  const { loading: satelliteCycleLoading } = useSubscription(SATELLITE_TOTAL_VOTING_POWER_SUBSCRIPTION, {
    variables: {
      satelliteAddress,
    },
    onData: ({ data: { data } }) => {
      if (!data) return

      const isCyclesValid = data.governance[0].cycle_id === data.governance[0].satellite_snapshots[0].cycle

      if (isCyclesValid) setSatelliteTotalVotingPower(data.governance[0].satellite_snapshots[0].total_voting_power)
    },
    shouldResubscribe: true,
  })

  return { isLoading: satelliteCycleLoading, satelliteTotalVotingPower }
}
