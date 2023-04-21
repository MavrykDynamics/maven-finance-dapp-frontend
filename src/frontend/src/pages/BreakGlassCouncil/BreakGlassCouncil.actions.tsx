import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
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
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

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

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.setAllContractsAdmin(newAdminAddress).send()
    dispatch(showToaster(INFO, 'Set All Contracts Admin...', 'Please wait 30s'))

    await transaction?.confirmation()
    await dispatch(getBreakGlassCouncilPendingActions())

    dispatch(showToaster(SUCCESS, 'Set All Contracts Admin is done', 'All good :)'))
    dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}

// Set Single Contract Admin
export const setSingleContractAdmin =
  (newAdminAddress: string, targetContract: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionFullScreenLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods.setSingleContractAdmin(newAdminAddress, targetContract).send()
      dispatch(showToaster(INFO, 'Set Single Contract Admin...', 'Please wait 30s'))

      await transaction?.confirmation()
      await dispatch(getBreakGlassCouncilPendingActions())

      dispatch(showToaster(SUCCESS, 'Set Single Contract Admin is done', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Sign Action
export const signAction = (breakGlassActionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.signAction(breakGlassActionID).send()
    dispatch(showToaster(INFO, 'Sign action...', 'Please wait 30s'))

    // confirm query completion
    await transaction?.confirmation()

    // @ts-ignore don't have proper type to acees data, type has only methods
    const currentOperationLevel = transaction?.lastHead?.header?.level

    // refetch data we need
    await checkIndexerLevelAndRunDataUpdateCallback({
      callback: async () => {
        await Promise.all([
          dispatch(getBreakGlassCouncilPendingActions()),
          dispatch(getBreakGlassCouncilPastActions()),
          dispatch(getBreakGlassCouncilMembers()),
        ])
      },
      currentOperationLevel,
    })

    dispatch(showToaster(SUCCESS, 'Sign Action is done', 'All good :)'))
    dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error('signAction - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}

// Add Council Member
export const addCouncilMember =
  (memberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionFullScreenLoader(true))
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .addCouncilMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()
      dispatch(showToaster(INFO, 'Add Council Member...', 'Please wait 30s'))

      await transaction?.confirmation()
      await dispatch(getBreakGlassCouncilPendingActions())

      dispatch(showToaster(SUCCESS, 'Add Council Member is done', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Update Council Member
export const updateCouncilMember =
  (newMemberName: string, newMemberWebsite: string, newMemberImage: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
        .send()

      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(showToaster(INFO, 'Update Council Member...', 'Please wait 30s'))

      await transaction?.confirmation()
      await dispatch(getBreakGlassCouncilMembers())

      dispatch(showToaster(SUCCESS, 'Update Council Member is done', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
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

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      dispatch(toggleActionFullScreenLoader(true))
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
      dispatch(showToaster(INFO, 'Change Council Member...', 'Please wait 30s'))

      await transaction?.confirmation()
      await dispatch(getBreakGlassCouncilPendingActions())

      dispatch(showToaster(SUCCESS, 'Change Council Member is done', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Remove Council Member
export const removeCouncilMember = (memberAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.removeCouncilMember(memberAddress).send()
    dispatch(showToaster(INFO, 'Remove Council Member...', 'Please wait 30s'))

    await transaction?.confirmation()
    await dispatch(getBreakGlassCouncilPendingActions())

    dispatch(showToaster(SUCCESS, 'Remove Council Member is done', 'All good :)'))
    dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}

// Propagate Break Glass
export const propagateBreakGlass = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.propagateBreakGlass().send()
    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    await transaction?.confirmation()
    await Promise.all([
      dispatch(getBreakGlassCouncilPendingActions()),
      dispatch(getBreakGlassCouncilPastActions()),
      dispatch(getBreakGlassCouncilMembers()),
    ])

    dispatch(showToaster(SUCCESS, 'Propagate Break Glass is done', 'All good :)'))
    dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}

// Drop Action
export const dropBreakGlass = (breakGlassActionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.flushAction(breakGlassActionID).send()
    dispatch(showToaster(INFO, 'Drop Action...', 'Please wait 30s'))

    await transaction?.confirmation()
    await dispatch(getBreakGlassCouncilPendingActions())

    dispatch(showToaster(SUCCESS, 'Drop Action is done', 'All good :)'))
    dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error('dropBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}
