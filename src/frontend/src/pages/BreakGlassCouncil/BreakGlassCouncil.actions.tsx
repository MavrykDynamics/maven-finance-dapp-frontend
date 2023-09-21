import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  ERROR,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY,
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY_NAME,
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY_VARIABLE,
  BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY,
  BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_NAME,
  BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_VARIABLE,
  BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY,
  BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME,
  BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE,
} from '../../gql/queries/getBreakGlassCouncilStorage'

// helpers
import {
  normalizeCouncilActions,
  normalizeCouncilMembers,
  PENDING_ACTIONS,
  PAST_ACTIONS,
} from 'pages/Council/Council.helpers'
import { parseDate } from 'utils/time'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// actions
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const timestamptz = parseDate({ time, timeFormat }) || undefined
export const CLEAR_MY_BREAK_GLASS_COUNCIL_ACTIONS = 'CLEAR_MY_BREAK_GLASS_COUNCIL_ACTIONS'

// getBreakGlassCouncilPendingActions
export const GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS = 'GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS'
export const getBreakGlassCouncilPendingActions = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state?.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY,
      BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME,
      BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE({ _gte: timestamptz }),
    )

    const breakGlassCouncil = storage?.break_glass_action || []

    const { allPendingActions, notMyPendingActions, myPendingActions, actionsMapper } = normalizeCouncilActions(
      breakGlassCouncil,
      PENDING_ACTIONS,
      accountPkh,
    )

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS,
      breakGlassCouncilActions: {
        allPendingActions,
        notMyPendingActions,
        myPendingActions,
        actionsMapper,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getBreakGlassCouncilPastActions
export const GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS = 'GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS'
export const getBreakGlassCouncilPastActions = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state?.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY,
      BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_NAME,
      BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_VARIABLE({ _lt: timestamptz }),
    )

    const breakGlassCouncil = storage?.break_glass_action || []

    const { allPastActions, myPastActions, actionsMapper } = normalizeCouncilActions(
      breakGlassCouncil,
      PAST_ACTIONS,
      accountPkh,
    )

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS,
      breakGlassCouncilActions: {
        allPastActions,
        myPastActions,
        actionsMapper,
      },
      isBreakGlassCouncilPastActionsLoaded: Boolean(accountPkh),
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getBreakGlassCouncilMembers
export const GET_BREAK_GLASS_COUNCIL_MEMBERS = 'GET_BREAK_GLASS_COUNCIL_MEMBERS'
export const getBreakGlassCouncilMembers = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_MEMBERS_QUERY,
      BREAK_GLASS_COUNCIL_MEMBERS_QUERY_NAME,
      BREAK_GLASS_COUNCIL_MEMBERS_QUERY_VARIABLE,
    )

    const members = storage?.break_glass_council_member || []
    const breakGlassCouncilMembers = normalizeCouncilMembers(members)

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_MEMBERS,
      breakGlassCouncilMembers,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// Set All Contracts Admin
export const setAllContractsAdmin = (newAdminAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.setAllContractsAdmin(newAdminAddress).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Set All Contracts Admin...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      await dispatch(toggleActionFullScreenLoader(false))
      await dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getBreakGlassCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(
            showToaster(TOASTER_SUCCESS, 'Set All Contracts Admin is done.', ACTION_COMPLETION_MESSAGE_TEXT),
          )
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Set All Contracts Admin error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// Sign Action
export const signAction = (breakGlassActionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.signAction(breakGlassActionID).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Sign...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      await dispatch(toggleActionFullScreenLoader(false))
      await dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getBreakGlassCouncilPendingActions())
          await dispatch(getBreakGlassCouncilPastActions())
          await dispatch(getBreakGlassCouncilMembers())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Sign is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Sign error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// Add Council Member
export const addCouncilMember =
  (memberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .addCouncilMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Add Council Member...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(getBreakGlassCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Add Council Member is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Add Council Member error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Update Council Member
export const updateCouncilMember =
  (newMemberName: string, newMemberWebsite: string, newMemberImage: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      callback()
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Update Council Member...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(getBreakGlassCouncilMembers())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Update Council Member is done.', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Update Council Member error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Change Council Member
export const changeCouncilMember =
  (
    oldCouncilMemberAddress: string,
    newCouncilMemberAddress: string,
    newMemberName: string,
    newMemberWebsite: string,
    newMemberImage: string,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .changeCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        )
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Change Council Member...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(getBreakGlassCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Change Council Member is done.', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Change Council Member error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Remove Council Member
export const removeCouncilMember = (memberAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.removeCouncilMember(memberAddress).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Remove Council Member...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      await dispatch(toggleActionFullScreenLoader(false))
      await dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getBreakGlassCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Remove Council Member is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Remove Council Member error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// TODO: update to use contracts
// Propagate Break Glass
export const propagateBreakGlass = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.propagateBreakGlass().send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Propagate Break Glass...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      await dispatch(toggleActionFullScreenLoader(false))
      await dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getBreakGlassCouncilPendingActions())
          await dispatch(getBreakGlassCouncilPastActions())
          await dispatch(getBreakGlassCouncilMembers())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Propagate Break Glass is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Propagate Break Glass error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// Drop Action
export const dropBreakGlass = (breakGlassActionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.flushAction(breakGlassActionID).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Drop Action...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      await dispatch(toggleActionFullScreenLoader(false))
      await dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getBreakGlassCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Drop Action is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Drop Action error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}
