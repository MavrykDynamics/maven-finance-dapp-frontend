import React, { useCallback, useContext, useMemo, useState } from 'react'
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
  showStakeErrorMessage,
  showStakeSuccessMessage,
} from './helpers/subUpdaters.helper'

export type StakeContext = {
  action: 'stake' | 'unstake' | ''
  updateStakeContext: (d: Partial<StakeContext>) => void
}

export const stakeContext = React.createContext<StakeContext>(undefined!)

export const StakeProvider = ({ children }: { children: React.ReactNode }) => {
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh, user } = useSelector((state: State) => state.wallet)
  const { isInitialDataLoading } = useSelector((state: State) => state.loading)

  const dispatch = useDispatch()

  const [stakeContextData, setStakeContextData] = useState<Omit<StakeContext, 'updateStakeContext'>>({
    action: '',
  })

  const updateStakeContext = useCallback((data: Partial<StakeContext>) => {
    setStakeContextData((prev) => ({ ...prev, ...data }))
  }, [])

  useSubscription(SUBSCRIPTION_STAKE, {
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        showStakeErrorMessage(dispatch, error.message)
      }
      updateDoormanStakeHistoryData(dispatch, data)
      const { action } = stakeContextData
      const capital = action.charAt(0).toUpperCase()
      const msg = capital + action.substring(1)
      if (action) {
        showStakeSuccessMessage(dispatch, msg)
        updateStakeContext({ action: '' })
      }
    },
    skip: isInitialDataLoading,
  })

  useSubscription(ADDRESS_BALANCE_DATA, {
    variables: {
      _eq: accountPkh,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        showStakeErrorMessage(dispatch, error.message)
      }
      updateUserStakeData(dispatch, user, data, accountPkh as string)
    },
    shouldResubscribe: true,
    skip: isInitialDataLoading,
  })

  useSubscription(DOORMAN_ADDRESS_BALANCE, {
    variables: {
      doormanContractAddress: doormanAddress.address,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        showStakeErrorMessage(dispatch, error.message)
      }
      updateDoormanStorageData(dispatch, data)
    },
    shouldResubscribe: true,
    skip: isInitialDataLoading,
  })

  const context: StakeContext = useMemo(
    () => ({
      ...stakeContextData,
      updateStakeContext,
    }),
    [stakeContextData, updateStakeContext],
  )

  return <stakeContext.Provider value={context}>{children}</stakeContext.Provider>
}

export const useStakeContext = () => {
  const context = useContext(stakeContext)

  if (!context) {
    throw new Error('StakeContext should be used withing StakeProvider')
  }

  return context
}
