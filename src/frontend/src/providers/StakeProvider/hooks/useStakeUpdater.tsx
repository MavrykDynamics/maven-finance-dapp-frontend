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
  STAKE_DEFAULT_LOADINGS,
  getInitialLoadingStateForFiredAction,
  StakeActionsLoaderState,
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
  const [actionLoaderState, setActionLoaderState] = useState<StakeActionsLoaderState>(STAKE_DEFAULT_LOADINGS)

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

  /**
   * Effect to turn off loader toaster and show success loader
   * @action action that user performing
   * @actionLoaderState loading state for action, cuz apollo shows correctly only initial loading state, then all loadings are false
   *
   * in 1st cond we check whether we have fired an action and if yes, set loading initial state for action we fired, and
   * @loadingStateUpdatedForAction means that loading state is updated to the fired action
   *
   * in 2nd cond we check whether action state is updated to the current action and all loading indicators are set to false (means all subs are performed), and then turn of loader,
   * show success toaster and reset action and action loading state
   */
  useEffect(() => {
    if (action && !actionLoaderState.loadingStateUpdatedForAction) {
      setActionLoaderState({ ...getInitialLoadingStateForFiredAction(action), loadingStateUpdatedForAction: action })
    }

    if (
      action &&
      !actionLoaderState.doormanBalance &&
      !actionLoaderState.history &&
      !actionLoaderState.userBalance &&
      actionLoaderState.loadingStateUpdatedForAction === action
    ) {
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
      setActionLoaderState(STAKE_DEFAULT_LOADINGS)
    }
  }, [
    action,
    actionLoaderState.doormanBalance,
    actionLoaderState.history,
    actionLoaderState.userBalance,
    actionLoaderState.loadingStateUpdatedForAction,
  ])

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
        setActionLoaderState({ ...actionLoaderState, history: false })
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
        setActionLoaderState({ ...actionLoaderState, doormanBalance: false })
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
        setActionLoaderState({ ...actionLoaderState, userBalance: false })
      }
    },
    shouldResubscribe: true,
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (!userBalanceLoading && !mvkStatsloading && !doormanBalanceLoading && !historyLoading && skip) {
      setShouldSkip(true)
    }
  }, [skip, userBalanceLoading, mvkStatsloading, doormanBalanceLoading, historyLoading])

  return {
    isLoading: historyLoading || userBalanceLoading || doormanBalanceLoading || mvkStatsloading,
  }
}
