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
import { State } from 'reducers'
import { StakingSubsSkipsType } from '../stake.provider.types'

// helpers
import { sleep } from 'utils/api/sleep'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'

// consts
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// queries
import {
  SUBSCRIPTION_STAKE_HISTORY,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
} from 'providers/StakeProvider/queries/doorman.query'

/**
 * Subscriptions are canceled on component unmount!
 * @param skipAddressBalance boolean, if you pass this param, the hook will ignore general mvk data sub
 * @param skipMvkTokenTotal boolean, if you pass this param, the hook will ignore general mvk total values sub
 * @param skipStakeHistory boolean, if you pass this param, the hook will ignore general sMVK & MVK history data sub
 * @returns {isInitialLoading: boolean, isActionLoading: boolean} isInitialLoading is false if initial data is still loading, true if it's loaded
 * isActionLoading is false if action update is done, true if it's in progress
 */
export const useStakeUpdater = (
  { skipAddressBalance, skipMvkTokenTotal, skipStakeHistory }: StakingSubsSkipsType = {
    skipAddressBalance: SUB_SUBSCRIBE,
    skipMvkTokenTotal: SUB_SUBSCRIBE,
    skipStakeHistory: SUB_SUBSCRIBE,
  },
) => {
  const [shouldSkip, setShouldSkip] = useState<StakingSubsSkipsType>({
    skipAddressBalance,
    skipMvkTokenTotal,
    skipStakeHistory,
  })

  const [actionLoaderState, setActionLoaderState] = useState<StakeActionsLoaderState>(STAKE_DEFAULT_LOADINGS)

  const dispatch = useDispatch()
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    // Methods to update data in context
    updateStakeHistoryData,
    updateTotalStakedMvk,
    updateTotalMvkToken,
    // manage toaster after action proceed methods
    updateStakeLoadingToasterId,
    updateStakeActionContext,
    loadingToasterId,
    action,
  } = useStakeContext()

  const { success, hideToasterMessage, bug } = useToasterContext()

  const { loading: historyLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip.skipStakeHistory === SUB_SKIP,
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) {
        console.error('SUBSCRIPTION_STAKE_HISTORY query error: ', error)
        bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
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
        bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
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
        bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
      }
      if (data) {
        updateTotalMvkToken(data)
      }
    },
    shouldResubscribe: true,
  })

  const isInitialLoading = historyLoading || doormanBalanceLoading || mvkStatsloading

  /**
   * Effect to manage toasters after sending action and it's sended correct
   * @action action that user performing
   * @actionLoaderState state that consist of subs that we need to track for certain action to show loaders
   *
   * in 1st cond we check whether we have fired an action and if yes, set loading initial state for action we fired, and
   * @loadingStateUpdatedForAction means that loading state is updated to the fired action
   *
   * in 2nd cond we check whether all subs that needs for certain action have updated, and turn off loading toaster, show success toaster,
   * unlocks action buttons and renewing part of context that responsible for actions update toasters
   */
  useEffect(() => {
    if (action && !actionLoaderState.loadingStateUpdatedForAction) {
      setActionLoaderState({ ...getInitialLoadingStateForFiredAction(action), loadingStateUpdatedForAction: action })
    }

    ;(async () => {
      if (
        action &&
        loadingToasterId &&
        !actionLoaderState.doormanBalance &&
        !actionLoaderState.history &&
        actionLoaderState.loadingStateUpdatedForAction === action
      ) {
        // removing loader toaster and showing success toaster
        hideToasterMessage(loadingToasterId)
        await sleep(300)
        success(TOASTER_ACTIONS_TEXTS[action]['end']['message'], TOASTER_ACTIONS_TEXTS[action]['end']['title'])

        // renewing context and internal state
        updateStakeLoadingToasterId(null)
        updateStakeActionContext('')
        setActionLoaderState(STAKE_DEFAULT_LOADINGS)

        // unlocking action buttons
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))
      }
    })()
  }, [
    action,
    loadingToasterId,
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

    if (isInitialLoading && skipStakeHistory === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipStakeHistory: SUB_SKIP,
      }))
    }
  }, [isInitialLoading, skipAddressBalance, skipMvkTokenTotal, skipStakeHistory])

  return {
    isInitialLoading,
    isActionLoading:
      action &&
      actionLoaderState.loadingStateUpdatedForAction === action &&
      (actionLoaderState.doormanBalance || !actionLoaderState.history),
  }
}
