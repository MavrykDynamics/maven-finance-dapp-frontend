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

export const DOORMAN_HISTORY_SUB = 'history'
export const DOORMAN_STATS_SUB = 'doormanStats'
export const USER_MVK_BALANCE_SUB = 'userMVK_balances'
type StakingSubscriptionsTypes = typeof USER_MVK_BALANCE_SUB | typeof DOORMAN_STATS_SUB | typeof DOORMAN_HISTORY_SUB

/**
 * Subscriptions are canceled on component unmount!
 * @param skip boolean, if you pass this param, the hook will be triggered only one time
 * @returns {isLoading: boolean} false if data is still loading, true if it's loaded
 */
export const useStakeUpdater = (skip = false, subsciptionsList: Array<StakingSubscriptionsTypes> = []) => {
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
  const isLoadAllQueries = subsciptionsList.length === 0

  const { loading: historyLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip || (!isLoadAllQueries && !subsciptionsList.includes(DOORMAN_HISTORY_SUB)),
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

  const { loading: doormanBalanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip || (!isLoadAllQueries && !subsciptionsList.includes(DOORMAN_STATS_SUB)),
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

  const { loading: mvkStatsloading } = useSubscription(SUBSCRIPTION_MVK_TOKEN_TOTAL, {
    skip: shouldSkip || (!isLoadAllQueries && !subsciptionsList.includes(DOORMAN_STATS_SUB)),
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
  const { loading: userBalanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip || (!isLoadAllQueries && !subsciptionsList.includes(USER_MVK_BALANCE_SUB)),
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
    if (!historyLoading && !userBalanceLoading && !doormanBalanceLoading && !mvkStatsloading && skip) {
      setShouldSkip(true)
    }

    // show toaster after action completion
    if (!historyLoading && !userBalanceLoading && !doormanBalanceLoading && !mvkStatsloading && action) {
      const capital = action.charAt(0).toUpperCase()
      const msg = capital + action.substring(1)
      showStakeSuccessMessage(dispatch, msg)
      updateStakeActionContext('')
    }
  }, [historyLoading, userBalanceLoading, doormanBalanceLoading, mvkStatsloading, skip, action])

  return {
    isLoading: historyLoading || userBalanceLoading || doormanBalanceLoading || mvkStatsloading,
    userBalanceLoading,
    dormanStatsLoading: doormanBalanceLoading || mvkStatsloading,
    historyLoading,
  }
}
