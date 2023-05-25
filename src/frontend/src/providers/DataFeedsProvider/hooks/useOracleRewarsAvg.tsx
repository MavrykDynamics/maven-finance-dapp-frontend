import { useState } from 'react'
import { useSubscription } from '@apollo/client'
import { REWARD_AMOUNT_SMVK } from 'gql/queries'
import { calcWithoutPrecision } from 'utils/calcFunctions'

export const useOracleRewarsAvg = () => {
  const [avg, setAvg] = useState(0)
  useSubscription(REWARD_AMOUNT_SMVK, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) {
        const averageRevard = calcWithoutPrecision(
          data.aggregator.reduce((acc, { reward_amount_smvk }) => {
            acc += reward_amount_smvk
            return acc
          }, 0) / Math.max(data.aggregator.length, 1),
        )
        setAvg(averageRevard)
      }
    },
  })

  return { oracleRewardsAvg: avg }
}
