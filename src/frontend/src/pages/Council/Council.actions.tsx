// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { State } from 'reducers'
import { TokenType } from 'utils/TypesAndInterfaces/General'

// helpers
import { parseDate } from 'utils/time'
import { normalizeCouncilActions, normalizeCouncilMembers, PENDING_ACTIONS, PAST_ACTIONS } from './Council.helpers'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { TOASTER_SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { ACTION_COMPLETION_MESSAGE_TEXT } from 'app/App.components/Toaster/Toaster.constants'
import { TOASTER_LOADING } from 'app/App.components/Toaster/Toaster.constants'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'app/App.components/Toaster/Toaster.constants'
import {
  ACTION_START_MESSAGE_TEXT,
  ERROR,
  TOASTER_ERROR,
  TOASTER_INFO,
} from 'app/App.components/Toaster/Toaster.constants'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  COUNCIL_MEMBERS_QUERY,
  COUNCIL_MEMBERS_QUERY_NAME,
  COUNCIL_MEMBERS_QUERY_VARIABLE,
  COUNCIL_PENDING_ACTIONS_QUERY,
  COUNCIL_PENDING_ACTIONS_NAME,
  COUNCIL_PENDING_ACTIONS_VARIABLE,
  COUNCIL_PAST_ACTIONS_QUERY,
  COUNCIL_PAST_ACTIONS_NAME,
  COUNCIL_PAST_ACTIONS_VARIABLE,
} from '../../gql/queries/getCouncilStorage'

// actions
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const timestamptz = parseDate({ time, timeFormat }) || undefined
export const CLEAR_MY_COUNCIL_ACTIONS = 'CLEAR_MY_COUNCIL_ACTIONS'

// getCouncilPendingActions
export const GET_COUNCIL_PENDING_ACTIONS = 'GET_COUNCIL_PENDING_ACTIONS'
export const getCouncilPendingActions = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PENDING_ACTIONS_QUERY,
      COUNCIL_PENDING_ACTIONS_NAME,
      COUNCIL_PENDING_ACTIONS_VARIABLE({ _gte: timestamptz }),
    )

    const council = storage?.council_action || []

    const { allPendingActions, notMyPendingActions, myPendingActions, actionsMapper } = normalizeCouncilActions(
      council,
      PENDING_ACTIONS,
      accountPkh,
    )

    dispatch({
      type: GET_COUNCIL_PENDING_ACTIONS,
      councilActions: {
        allPendingActions,
        notMyPendingActions,
        myPendingActions,
        actionsMapper,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      console.log('error', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getCouncilPastActions
export const GET_COUNCIL_PAST_ACTIONS = 'GET_COUNCIL_PAST_ACTIONS'
export const getCouncilPastActions = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PAST_ACTIONS_QUERY,
      COUNCIL_PAST_ACTIONS_NAME,
      COUNCIL_PAST_ACTIONS_VARIABLE,
    )

    const council = storage?.council_action || []

    const { allPastActions, myPastActions, actionsMapper } = normalizeCouncilActions(council, PAST_ACTIONS, accountPkh)

    dispatch({
      type: GET_COUNCIL_PAST_ACTIONS,
      councilActions: {
        allPastActions,
        myPastActions,
        actionsMapper,
      },
      isCouncilPastActionsLoaded: Boolean(accountPkh),
    })
  } catch (error) {
    if (error instanceof Error) {
      console.log('error', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getCouncilMembers
export const GET_COUNCIL_MEMBERS = 'GET_COUNCIL_MEMBERS'
export const getCouncilMembers = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_MEMBERS_QUERY,
      COUNCIL_MEMBERS_QUERY_NAME,
      COUNCIL_MEMBERS_QUERY_VARIABLE,
    )

    const members = storage?.council?.[0]?.members || []
    const councilMembers = normalizeCouncilMembers(members)

    await dispatch({
      type: GET_COUNCIL_MEMBERS,
      councilMembers,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// Sign
export const sign = (actionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.signAction(actionID).send()

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
          await dispatch(getCouncilPendingActions())
          await dispatch(getCouncilPastActions())
          await dispatch(getCouncilMembers())

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

// Add Vestee
export const addVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionAddVestee(
          vesteeAddress,
          convertNumberForContractCall({ number: totalAllocated, grade: MVK_DECIMALS }),
          cliffInMonths,
          vestingInMonths,
        )
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Add Vestee...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Add Vestee is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Add Vestee error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Add member
export const addCouncilMember =
  (newMemberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionAddMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Add Member...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Add Member is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Add Member error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Update Vestee
export const updateVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionUpdateVestee(
          vesteeAddress,
          convertNumberForContractCall({ number: totalAllocated, grade: MVK_DECIMALS }),
          cliffInMonths,
          vestingInMonths,
        )
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Update Vestee...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Update Vestee is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Update Vestee error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Toggle Vestee Lock
export const toggleVesteeLock = (vesteeAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionToggleVesteeLock(vesteeAddress).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Toggle Vestee Lock...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Toggle Vestee Lock is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Toggle Vestee Lock error:', error)
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
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionChangeMember(
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
            await dispatch(getCouncilPendingActions())

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
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionRemoveMember(memberAddress).send()

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
          await dispatch(getCouncilPendingActions())

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

// Update Council Member Info
export const updateCouncilMemberInfo =
  (newMemberName: string, newMemberWebsite: string, newMemberImage: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      callback()
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Update Council Member Info...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilMembers())

            await dispatch(hideToaster())
            await dispatch(
              showToaster(TOASTER_SUCCESS, 'Update Council Member Info is done.', ACTION_COMPLETION_MESSAGE_TEXT),
            )
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Update Council Member Info error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Transfer Tokens
export const transferTokens =
  (
    receiverAddress: string,
    tokenContractAddress: string,
    tokenAmount: number,
    tokenType: TokenType,
    tokenId: number,
    purpose: string,
    decimals: number,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionTransfer(
          receiverAddress,
          tokenContractAddress,
          convertNumberForContractCall({ number: tokenAmount, grade: decimals }),
          tokenType,
          tokenId,
          purpose,
        )
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Transfer Tokens...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Transfer Tokens is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Transfer Tokens error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Request Tokens
export const requestTokens =
  (
    treasuryAddress: string,
    tokenContractAddress: string,
    tokenName: string,
    tokenAmount: number,
    tokenType: TokenType,
    tokenId: number,
    purpose: string,
    decimals: number,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionRequestTokens(
          treasuryAddress,
          tokenContractAddress,
          tokenName,
          convertNumberForContractCall({ number: tokenAmount, grade: decimals }),
          tokenType,
          tokenId,
          purpose,
        )
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Request Tokens...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Request Tokens is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Request Tokens error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Request Token Mint
export const requestTokenMint =
  (treasuryAddress: string, tokenAmount: number, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionRequestMint(
          treasuryAddress,
          convertNumberForContractCall({ number: tokenAmount, grade: MVK_DECIMALS }),
          purpose,
        )
        .send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Request Token Mint...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Request Token Mint is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Request Token Mint error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Drop Financial Request
export const dropFinancialRequest = (financialReqID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionDropFinancialReq(financialReqID).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Drop Financial Request...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(
            showToaster(TOASTER_SUCCESS, 'Drop Financial Request is done.', ACTION_COMPLETION_MESSAGE_TEXT),
          )
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Drop Financial Request error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// Remove Vestee Request
export const removeVesteeRequest = (vesteeAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionRemoveVestee(vesteeAddress).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Remove Vestee Request...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Remove Vestee Request is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Remove Vestee Request error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// Set Baker Request
export const setBakerRequest = (bakerHash: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionSetBaker(bakerHash).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Set Baker...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Set Baker is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Set Baker error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

// Set Contract Baker Request
export const setContractBakerRequest =
  (targetContractAddress: string, keyHash: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods.councilActionSetContractBaker(targetContractAddress, keyHash).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Set Contract Baker...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getCouncilPendingActions())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Set Contract Baker is done.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('Set Contract Baker error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// Drop Request
export const dropRequest = (actionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    await dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.flushAction(actionID).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Drop Request...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getCouncilPendingActions())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Drop Request is done.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('Drop Request error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}
