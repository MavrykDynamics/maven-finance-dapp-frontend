import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSubscription } from '@apollo/client'
import { useStakeContext } from '../stake.provider'

// types
import { AppDispatch } from 'app/App.controller'
import {
  StakingSubscriptionsTypes,
  DOORMAN_HISTORY_SUB,
  DOORMAN_STATS_SUB,
  USER_MVK_BALANCE_SUB,
} from '../helpers/stake.consts'

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
      if (data) {
        updateTotalStakedMvk(data)
      }
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
      if (data) {
        updateTotalMvkToken(data)
      }
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
      if (data) {
        updateUserStakeData(data)
      }
    },
    shouldResubscribe: true,
  })

  useEffect(() => {
    // to update data only one time
    if (!userBalanceLoading && !mvkStatsloading && !doormanBalanceLoading && !historyLoading && skip) {
      setShouldSkip(true)
    }

    // TODO: do it after data is updated after action completion
    // show toaster after action completion
    if (action) {
      dispatch(hideToaster())
      dispatch(
        showToaster(
          TOASTER_SUCCESS,
          `${action.charAt(0).toUpperCase() + action.substring(1)} done`,
          ACTION_COMPLETION_MESSAGE_TEXT,
        ),
      )
      dispatch(toggleActionCompletion(false))
      updateStakeActionContext('')
    }
  }, [
    skip,
    action,
    userBalanceLoading,
    mvkStatsloading,
    doormanBalanceLoading,
    historyLoading,
    dispatch,
    updateStakeActionContext,
  ])

  return {
    isLoading: historyLoading || userBalanceLoading || doormanBalanceLoading || mvkStatsloading,
    userBalanceLoading,
    dormanStatsLoading: doormanBalanceLoading || mvkStatsloading,
    historyLoading,
  }
}
