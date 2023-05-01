import { useEffect, useState } from 'react'
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
import {
  SUBSCRIPTION_STAKE,
  ADDRESS_BALANCE_DATA,
  DOORMAN_ADDRESS_BALANCE,
  MVK_TOKEN_TOTAL,
} from 'gql/subscriptions/stakingData'

// helpers
function showStakeSuccessMessage(dispatch: AppDispatch, message: string) {
  dispatch(hideToaster())
  dispatch(showToaster(TOASTER_SUCCESS, `${message} done`, ACTION_COMPLETION_MESSAGE_TEXT))
  dispatch(toggleActionCompletion(false))
}

export const useStakeUpdater = (skip = false) => {
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { updateStakeHistoryData, updateTotalStakedMvk, updateUserStakeData, updateStakingAction, action } =
    useStakeContext()

  const dispatch = useDispatch()

  const [shouldSkip, setShouldSkip] = useState(false)

  const { loading: stakeLoading } = useSubscription(SUBSCRIPTION_STAKE, {
    skip: shouldSkip,
    onData: ({ data: result }) => {
      console.log('HELLO WORLD')
      const { data, error } = result
      if (error) {
        // showStakeErrorMessage(dispatch, error.message)
      }
      if (data) {
        updateStakeHistoryData(data)
        const capital = action.charAt(0).toUpperCase()
        const msg = capital + action.substring(1)
        showStakeSuccessMessage(dispatch, msg)
        updateStakingAction('')
      }
    },
  })

  const { loading: balanceLoading } = useSubscription(ADDRESS_BALANCE_DATA, {
    skip: shouldSkip,
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

  const { loading: doormanLoading } = useSubscription(DOORMAN_ADDRESS_BALANCE, {
    skip: shouldSkip,
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

  useEffect(() => {
    if (!stakeLoading && !balanceLoading && !doormanLoading && skip && !shouldSkip) {
      setShouldSkip(skip)
    }
  }, [doormanLoading, balanceLoading, stakeLoading, skip, shouldSkip])

  return { isLoading: stakeLoading && balanceLoading && doormanLoading }
}
