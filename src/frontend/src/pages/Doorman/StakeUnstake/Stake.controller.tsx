import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSubscription } from '@apollo/client'

// subs
import { SUBSCRIPTION_STAKE, ADDRESS_BALANCE_DATA, DOORMAN_ADDRESS_BALANCE } from 'gql/subscriptions/stakingData'

// helpers
import { State } from 'reducers'
import {
  updateDoormanStakeHistoryData,
  updateUserStakeData,
  updateDoormanStorageData,
} from './helpers/subUpdaters.helper'

export const StakeController = ({ children }: { children: React.ReactNode }) => {
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh, user } = useSelector((state: State) => state.wallet)

  const dispatch = useDispatch()

  useSubscription(SUBSCRIPTION_STAKE, {
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) console.error(error)
      updateDoormanStakeHistoryData(dispatch, data)
      console.log(data, ' SUBSCRIPTION_STAKE (doorman s)')
    },
  })

  useSubscription(ADDRESS_BALANCE_DATA, {
    variables: {
      _eq: accountPkh,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) console.error(error)
      updateUserStakeData(dispatch, user, data, accountPkh as string)
      console.log(data, 'ADDRESS_BALANCE_DATA (address)')
    },
  })

  useSubscription(DOORMAN_ADDRESS_BALANCE, {
    variables: {
      doormanContractAddress: doormanAddress.address,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) console.error(error)
      updateDoormanStorageData(dispatch, data)
      console.log(data, ' DOORMAN_ADDRESS_BALANCE (doorman d)')
    },
  })
  return <>{children}</>
}
