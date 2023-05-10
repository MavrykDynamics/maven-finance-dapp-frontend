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
  SUBSCRIPTION_STAKE_HISTORY,
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
} from 'gql/subscriptions/stakingData'

// helpers
function showStakeSuccessMessage(dispatch: AppDispatch, message: string) {
  dispatch(hideToaster())
  dispatch(showToaster(TOASTER_SUCCESS, `${message} done`, ACTION_COMPLETION_MESSAGE_TEXT))
  dispatch(toggleActionCompletion(false))
}

/**
 * Subscriptions are canceled on component unmount!
 * @param skip boolean, if you pass this param, the hook will be triggered only one time
 * @returns {isLoading: boolean} false if data is still loading, true if it's loaded
 */
export const useStakeUpdater = (skip = false) => {
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    updateStakeHistoryData,
    updateTotalStakedMvk,
    updateUserStakeData,
    updateTotalMvkToken,
    updateStakeActionContext,
    action,
  } = useStakeContext()

  const dispatch = useDispatch()

  const [shouldSkip, setShouldSkip] = useState(false)

  const { loading: stakeLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip,
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        // showStakeErrorMessage(dispatch, error.message)
      }
      if (data) {
        updateStakeHistoryData(data)
      }
    },
  })

  const { loading: doormanLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip,
    variables: {
      _eq: doormanAddress.address,
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

  const { loading: totalMvkloading } = useSubscription(SUBSCRIPTION_MVK_TOKEN_TOTAL, {
    skip: shouldSkip,
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        // showStakeErrorMessage(dispatch, error.message)
      }
      if (data) updateTotalMvkToken(data)
    },
    shouldResubscribe: true,
  })

  // TODO: will be moved to user context when user data will be transfered to context
  const { loading: balanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
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

  useEffect(() => {
    // to update data only one time
    if (!stakeLoading && !balanceLoading && !doormanLoading && !totalMvkloading && skip) {
      setShouldSkip(true)
    }

    // show toaster after action completion
    if (!stakeLoading && !balanceLoading && !doormanLoading && !totalMvkloading && action) {
      const capital = action.charAt(0).toUpperCase()
      const msg = capital + action.substring(1)
      showStakeSuccessMessage(dispatch, msg)
      updateStakeActionContext('')
    }
  }, [stakeLoading, balanceLoading, doormanLoading, totalMvkloading, skip, action])

  return { isLoading: stakeLoading || balanceLoading || doormanLoading || totalMvkloading }
}
