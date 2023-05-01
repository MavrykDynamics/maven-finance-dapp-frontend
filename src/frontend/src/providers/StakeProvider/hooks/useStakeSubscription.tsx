import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSubscription } from '@apollo/client'
import { useStakeContext } from '../stake.provider'

// types
import { AppDispatch } from 'app/App.controller'

// ------------------------------------------
import { ACTION_COMPLETION_MESSAGE_TEXT, TOASTER_SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

// types
import { State } from 'reducers'

// queries
import { SUBSCRIPTION_STAKE, ADDRESS_BALANCE_DATA, DOORMAN_ADDRESS_BALANCE } from 'gql/subscriptions/stakingData'

// helpers
function showStakeSuccessMessage(dispatch: AppDispatch, message: string) {
  dispatch(hideToaster())
  dispatch(showToaster(TOASTER_SUCCESS, `${message} done`, ACTION_COMPLETION_MESSAGE_TEXT))
  dispatch(toggleActionCompletion(false))
}

export const useStakeSubscription = () => {
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { updateStakeHistoryData, updateTotalStakedMvk, updateUserStakeData, updateStakingAction, action } =
    useStakeContext()

  const dispatch = useDispatch()

  useSubscription(SUBSCRIPTION_STAKE, {
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        // showStakeErrorMessage(dispatch, error.message)
      }
      if (data && action) {
        updateStakeHistoryData(data)
        const capital = action.charAt(0).toUpperCase()
        const msg = capital + action.substring(1)
        showStakeSuccessMessage(dispatch, msg)
        updateStakingAction('')
      }
    },
  })

  useSubscription(ADDRESS_BALANCE_DATA, {
    variables: {
      _eq: accountPkh,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        // showStakeErrorMessage(dispatch, error.message)
      }
      if (data) updateUserStakeData(data)
    },
    shouldResubscribe: true,
  })

  useSubscription(DOORMAN_ADDRESS_BALANCE, {
    variables: {
      doormanContractAddress: doormanAddress.address,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        // showStakeErrorMessage(dispatch, error.message)
      }
      if (data) updateTotalStakedMvk(data)
    },
    shouldResubscribe: true,
  })
  return <div>useStakeSubscription</div>
}
