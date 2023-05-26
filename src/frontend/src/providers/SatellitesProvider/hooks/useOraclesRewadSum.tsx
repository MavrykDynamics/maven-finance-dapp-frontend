import { useState } from 'react'
import { useSubscription } from '@apollo/client'
import { ORACLES_TOTAL_REWARD } from 'gql/queries'
import { calcWithoutPrecision } from 'utils/calcFunctions'

export const useOraclesRewadSum = () => {
  const [totalReward, setTotalReward] = useState(0)

  useSubscription(ORACLES_TOTAL_REWARD, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data)
        setTotalReward(calcWithoutPrecision(data.aggregator_oracle_reward_aggregate.aggregate?.sum?.reward ?? 0))
    },
  })

  return totalReward
}
