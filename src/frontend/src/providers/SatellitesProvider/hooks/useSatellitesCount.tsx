import React, { useState } from 'react'
import { useSubscription } from '@apollo/client'
import { ALL_SATELLITES_COUNT_STAT } from 'gql/queries'

export const useSatellitesCount = () => {
  const [count, setCount] = useState(0)
  useSubscription(ALL_SATELLITES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setCount(data.satellite_aggregate.aggregate?.count ?? 0)
      }
    },
  })

  return count
}
