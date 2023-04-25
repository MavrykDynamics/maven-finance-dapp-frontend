import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { getBreakGlassConfig } from 'pages/BreakGlass/BreakGlass.actions'
import { hideToaster, showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { normalizeEmergencyGovernance } from '../EmergencyGovernance/EmergencyGovernance.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from '../../app/App.components/Toaster/Toaster.constants'
import {
  EMERGENCY_GOVERNANCE_STORAGE_QUERY,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries'

import type { AppDispatch, GetState } from '../../app/App.controller'
import { State } from '../../reducers'
import { EmergencyGovernanceProposalForm } from '../../utils/TypesAndInterfaces/Forms'

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_EMERGENCY_GOVERNANCE_STORAGE'
export const getEmergencyGovernanceStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const storage = await fetchFromIndexer(
    EMERGENCY_GOVERNANCE_STORAGE_QUERY,
    EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
    EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
  )

  const { emergencyGovernanceLedger, eGovConfig } = normalizeEmergencyGovernance(storage?.emergency_governance[0])

  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceLedger,
    eGovConfig,
  })
}

export const submitEmergencyGovernanceProposal =
  (form: EmergencyGovernanceProposalForm, callback?: () => void) =>
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
      const contract = await tezos.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)
      const transaction = await contract?.methods
        .triggerEmergencyControl(form.title, form.description)
        .send({ amount: state.emergencyGovernance.config.requiredFeeMutez ?? 0 })

      callback?.()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Submitting emergency proposal...', ACTION_START_MESSAGE_TEXT))

      await transaction?.confirmation()

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
            await dispatch(getEmergencyGovernanceStorage())
            await dispatch(getBreakGlassConfig())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Emergency Proposal Submitted', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

export const voteEmergencyGovernanceProposal = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)
    const transaction = await contract?.methods.voteForEmergencyControl().send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Voting for emergency proposal...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getEmergencyGovernanceStorage())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Emergency Proposal voted', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

export const dropEmergencyGovernanceProposal = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)
    const transaction = await contract?.methods.dropEmergencyGovernance().send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Dropping emergency proposal...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getEmergencyGovernanceStorage())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Emergency Proposal dropped', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}
