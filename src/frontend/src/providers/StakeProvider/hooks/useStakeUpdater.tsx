import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSubscription } from '@apollo/client'
import { useStakeContext } from '../stake.provider'

// types
import {
  StakingSubscriptionsTypes,
  DOORMAN_HISTORY_SUB,
  DOORMAN_STATS_SUB,
  USER_MVK_BALANCE_SUB,
  STAKE_DEFAULT_LOADINGS,
  getInitialLoadingStateForFiredAction,
  StakeActionsLoaderState,
} from '../helpers/stake.consts'

// types
import { State } from 'reducers'

// queries
import {
  SUBSCRIPTION_STAKE_HISTORY,
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
} from 'gql/subscriptions/stakingData'
import { subsciptionErrorToaster } from 'app/App.components/Toaster/builtActions/actions-helpers.notifications'

/**
 * Subscriptions are canceled on component unmount!
 * @param skip boolean, if you pass this param, the hook will be triggered only one time
 * @returns {isInitialLoading: boolean, isActionLoading: boolean} isInitialLoading is false if initial data is still loading, true if it's loaded
 * isActionLoading is false if action update is done, true if it's in progress
 *
 * TODO: add toasters for subs errors handling
 */
export const useStakeUpdater = (skip = false, subsciptionsList: Array<StakingSubscriptionsTypes> = []) => {
  const [actionLoaderState, setActionLoaderState] = useState<StakeActionsLoaderState>(STAKE_DEFAULT_LOADINGS)

  const dispatch = useDispatch()
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    updateStakeHistoryData,
    updateTotalStakedMvk,
    updateUserStakeData,
    updateTotalMvkToken,
    updateStakeActionLoaderContext,
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
   * in 2nd cond we check whether action state is updated to the current action and all loading indicators are set to false (means all subs are performed), and then
   * change action loadingFinish to true, and in provider in componentDidUpdate turn off loader
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
      updateStakeActionLoaderContext(true)
      setActionLoaderState(STAKE_DEFAULT_LOADINGS)
    }
  }, [
    action,
    actionLoaderState.doormanBalance,
    actionLoaderState.history,
    actionLoaderState.userBalance,
    actionLoaderState.loadingStateUpdatedForAction,
  ])

  const [shouldSkip, setShouldSkip] = useState(false)
  const isLoadAllQueries = subsciptionsList.length === 0

  const { loading: historyLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip || (!isLoadAllQueries && !subsciptionsList.includes(DOORMAN_HISTORY_SUB)),
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        console.error('SUBSCRIPTION_STAKE_HISTORY query error: ', error)
        dispatch(subsciptionErrorToaster())
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
        console.error('SUBSCRIPTION_ADDRESS_BALANCE_DATA query error: ', error)
        dispatch(subsciptionErrorToaster())
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
        console.error('SUBSCRIPTION_MVK_TOKEN_TOTAL query error: ', error)
        dispatch(subsciptionErrorToaster())
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
        console.error('SUBSCRIPTION_ADDRESS_BALANCE_DATA query error: ', error)
        dispatch(subsciptionErrorToaster())
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
    isIntialLoading: historyLoading || userBalanceLoading || doormanBalanceLoading || mvkStatsloading,
    isActionLoading:
      action &&
      actionLoaderState.loadingStateUpdatedForAction === action &&
      (actionLoaderState.doormanBalance || !actionLoaderState.history || !actionLoaderState.userBalance),
  }
}
