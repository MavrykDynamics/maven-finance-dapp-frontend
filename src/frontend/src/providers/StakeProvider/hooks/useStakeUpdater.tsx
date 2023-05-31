import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSubscription } from '@apollo/client'
import { useStakeContext } from '../stake.provider'

// types
import {
  STAKE_DEFAULT_LOADINGS,
  getInitialLoadingStateForFiredAction,
  StakeActionsLoaderState,
} from '../helpers/stake.consts'

// types
import { State } from 'reducers'
import { StakingSubsSkipsType } from '../stake.provider.types'

// queries
import {
  SUBSCRIPTION_STAKE_HISTORY,
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
} from 'gql/subscriptions/stakingData'
import { subsciptionErrorToaster } from 'app/App.components/Toaster/builtActions/actions-helpers.notifications'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'

/**
 * Subscriptions are canceled on component unmount!
 * @param skip boolean, if you pass this param, the hook will be triggered only one time
 * @returns {isInitialLoading: boolean, isActionLoading: boolean} isInitialLoading is false if initial data is still loading, true if it's loaded
 * isActionLoading is false if action update is done, true if it's in progress
 */
export const useStakeUpdater = (
  { skipAddressBalance, skipMvkTokenTotal, skipStakeHistory, skipUserBalance }: StakingSubsSkipsType = {
    skipAddressBalance: SUB_SUBSCRIBE,
    skipMvkTokenTotal: SUB_SUBSCRIBE,
    skipStakeHistory: SUB_SUBSCRIBE,
    skipUserBalance: SUB_SUBSCRIBE,
  },
) => {
  const [shouldSkip, setShouldSkip] = useState<StakingSubsSkipsType>({
    skipAddressBalance,
    skipMvkTokenTotal,
    skipStakeHistory,
    skipUserBalance,
  })

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

  const { loading: historyLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip.skipStakeHistory === SUB_SKIP,
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
    skip: shouldSkip.skipAddressBalance === SUB_SKIP,
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
    skip: shouldSkip.skipMvkTokenTotal === SUB_SKIP,
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
    skip: shouldSkip.skipUserBalance === SUB_SKIP,
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

  const isInitialLoading = historyLoading || userBalanceLoading || doormanBalanceLoading || mvkStatsloading

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

  useEffect(() => {
    if (isInitialLoading && skipAddressBalance === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipAddressBalance: SUB_SKIP,
      }))
    }

    if (isInitialLoading && skipMvkTokenTotal === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipMvkTokenTotal: SUB_SKIP,
      }))
    }

    if (isInitialLoading && skipUserBalance === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipUserBalance: SUB_SKIP,
      }))
    }

    if (isInitialLoading && skipStakeHistory === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipStakeHistory: SUB_SKIP,
      }))
    }
  }, [isInitialLoading, skipAddressBalance, skipMvkTokenTotal, skipStakeHistory, skipUserBalance])

  return {
    isInitialLoading,
    isActionLoading:
      action &&
      actionLoaderState.loadingStateUpdatedForAction === action &&
      (actionLoaderState.doormanBalance || !actionLoaderState.history || !actionLoaderState.userBalance),
  }
}
