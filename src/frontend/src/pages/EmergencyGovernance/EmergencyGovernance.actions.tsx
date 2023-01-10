import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import {
  EMERGENCY_GOVERNANCE_STORAGE_QUERY,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries'
import { State } from '../../reducers'
import { getDoormanStorage, getMvkTokenStorage } from '../Doorman/Doorman.actions'
import { HIDE_EXIT_FEE_MODAL } from '../Doorman/ExitFeeModal/ExitFeeModal.actions'
import { normalizeEmergencyGovernance } from '../EmergencyGovernance/EmergencyGovernance.helpers'
import { EmergencyGovernanceProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER } from 'utils/constants'

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_EMERGENCY_GOVERNANCE_STORAGE'
export const SET_EMERGENCY_GOVERNANCE_ACTIVE = 'SET_EMERGENCY_GOVERNANCE_ACTIVE'
export const SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV = 'SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV'
export const getEmergencyGovernanceStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const storage = await fetchFromIndexer(
    EMERGENCY_GOVERNANCE_STORAGE_QUERY,
    EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
    EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
  )

  const emergencyGovernanceStorage = normalizeEmergencyGovernance(storage?.emergency_governance[0])

  const currentEmergencyGovernanceId = emergencyGovernanceStorage.currentEmergencyGovernanceRecordId

  dispatch({
    type: SET_EMERGENCY_GOVERNANCE_ACTIVE,
    emergencyGovActive: currentEmergencyGovernanceId !== 0,
  })
  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceStorage: emergencyGovernanceStorage,
  })
}

export const submitEmergencyGovernanceProposal =
  (form: EmergencyGovernanceProposalForm) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)
      const transaction = await contract?.methods
        .triggerEmergencyControl(form.title, form.description)
        .send({ amount: state.emergencyGovernance.emergencyGovernanceStorage.config.requiredFeeMutez || 0 })

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Submitting emergency proposal...', 'Please wait 30s'))
      await dispatch({
        type: HIDE_EXIT_FEE_MODAL,
      })

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Emergency Proposal Submitted', 'All good :)'))
      await dispatch(getMvkTokenStorage())
      await dispatch(getDoormanStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const voteEmergencyGovernanceProposal = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)
    const transaction = await contract?.methods.voteForEmergencyControl().send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Voting for emergency proposal...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Emergency Proposal voted', 'All good :)'))
    await dispatch(getMvkTokenStorage())
    await dispatch(getDoormanStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
