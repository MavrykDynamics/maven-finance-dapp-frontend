import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'

// helpers
import { parseDate } from 'utils/time'
import {
  normalizeCouncilActions,
  normalizeCouncilMembers,
  normalizeMaxLength,
  PENDING_ACTIONS,
  PAST_ACTIONS,
} from './Council.helpers'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// gql
import {
  COUNCIL_STORAGE_QUERY,
  COUNCIL_STORAGE_QUERY_NAME,
  COUNCIL_STORAGE_QUERY_VARIABLE,
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
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const timestamptz = parseDate({ time, timeFormat }) || undefined
export const CLEAR_MY_COUNCIL_ACTIONS = 'CLEAR_MY_COUNCIL_ACTIONS'

// getCouncilStorage
export const GET_COUNCIL_STORAGE = 'GET_COUNCIL_STORAGE'
export const getCouncilStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_STORAGE_QUERY,
      COUNCIL_STORAGE_QUERY_NAME,
      COUNCIL_STORAGE_QUERY_VARIABLE,
    )

    const council = storage?.council[0]
    const councilMaxLength = normalizeMaxLength(council)

    dispatch({
      type: GET_COUNCIL_STORAGE,
      councilMaxLength,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.log('error', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

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

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.signAction(actionID).send()

    await dispatch(toggleActionFullScreenLoader(true))
    await dispatch(showToaster(INFO, 'Sign...', 'Please wait 30s'))

    // confirm query completion
    await transaction?.confirmation()

    // @ts-ignore don't have proper type to acees data, type has only methods
    const currentOperationLevel = transaction?.lastHead?.header?.level

    // refetch data we need
    await checkIndexerLevelAndRunDataUpdateCallback({
      callback: async () => {
        await Promise.all([
          dispatch(getCouncilPendingActions()),
          dispatch(getCouncilPastActions()),
          dispatch(getCouncilMembers()),
        ])
      },
      currentOperationLevel,
    })

    await dispatch(showToaster(SUCCESS, 'Sign is done', 'All good :)'))
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

// Add Vestee
export const addVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
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
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Add Vestee...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Add Vestee is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Add member
export const addCouncilMember =
  (newMemberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionAddMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Add Council Member...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Add Council Member is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Update Vestee
export const updateVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
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
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Update Vestee...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Update Vestee is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Toggle Vestee Lock
export const toggleVesteeLock = (vesteeAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionToggleVesteeLock(vesteeAddress).send()
    await dispatch(toggleActionFullScreenLoader(true))

    dispatch(showToaster(INFO, 'Toggle Vestee Lock...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Toggle Vestee Lock is done', 'All good :)'))

    await dispatch(getCouncilPendingActions())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
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

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
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
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Change Council Member...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Change Council Member is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Remove Council Member
export const removeCouncilMember = (memberAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionRemoveMember(memberAddress).send()
    await dispatch(toggleActionFullScreenLoader(true))

    dispatch(showToaster(INFO, 'Remove Council Member...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Remove Council Member is done', 'All good :)'))

    await dispatch(getCouncilPendingActions())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

// Update Council Member Info
export const updateCouncilMemberInfo =
  (newMemberName: string, newMemberWebsite: string, newMemberImage: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
        .send()

      callback()
      await dispatch(toggleActionFullScreenLoader(true))

      await dispatch(showToaster(INFO, 'Update Council Member Info...', 'Please wait 30s'))
      await transaction?.confirmation()
      await dispatch(showToaster(SUCCESS, 'Update Council Member Info is done', 'All good :)'))

      await dispatch(getCouncilMembers())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
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

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
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
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Transfer Tokens...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Transfer Tokens is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
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

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
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

      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Request Tokens...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Request Tokens is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Request Token Mint
export const requestTokenMint =
  (treasuryAddress: string, tokenAmount: number, purpose: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionRequestMint(
          treasuryAddress,
          convertNumberForContractCall({ number: tokenAmount, grade: MVK_DECIMALS }),
          purpose,
        )
        .send()
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Request Tokens...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Request Tokens is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Drop Financial Request
export const dropFinancialRequest = (financialReqID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionDropFinancialReq(financialReqID).send()
    await dispatch(toggleActionFullScreenLoader(true))

    dispatch(showToaster(INFO, 'Drop Financial Request...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Drop Financial Request is done', 'All good :)'))

    await dispatch(getCouncilPendingActions())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

// Remove Vestee Request
export const removeVesteeRequest = (vesteeAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionRemoveVestee(vesteeAddress).send()
    await dispatch(toggleActionFullScreenLoader(true))

    dispatch(showToaster(INFO, 'Remove Vestee Request...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Remove Vestee Request is done', 'All good :)'))

    await dispatch(getCouncilPendingActions())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

// Set Baker Request
export const setBakerRequest = (bakerHash: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionSetBaker(bakerHash).send()
    await dispatch(toggleActionFullScreenLoader(true))

    dispatch(showToaster(INFO, 'Set Baker Request...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Set Baker Request is done', 'All good :)'))

    await dispatch(getCouncilPendingActions())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

// Set Contract Baker Request
export const setContractBakerRequest =
  (targetContractAddress: string, keyHash: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionActive) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods.councilActionSetContractBaker(targetContractAddress, keyHash).send()
      await dispatch(toggleActionFullScreenLoader(true))

      dispatch(showToaster(INFO, 'Set Contract Baker Request...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Set Contract Baker Request is done', 'All good :)'))

      await dispatch(getCouncilPendingActions())
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

// Drop Request
export const dropRequest = (actionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    await dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.councilAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.flushAction(actionID).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Set Contract Baker Request...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Set Contract Baker Request is done', 'All good :)'))

    await dispatch(getCouncilPendingActions())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}
