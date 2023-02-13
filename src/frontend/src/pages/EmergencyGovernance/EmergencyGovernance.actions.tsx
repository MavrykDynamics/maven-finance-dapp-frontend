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
import { normalizeEmergencyGovernance } from '../EmergencyGovernance/EmergencyGovernance.helpers'
import { EmergencyGovernanceProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'

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
        .send({ amount: state.emergencyGovernance.config.requiredFeeMutez || 0 })

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Submitting emergency proposal...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Emergency Proposal Submitted', 'All good :)'))

      await dispatch(getEmergencyGovernanceStorage())
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

    await dispatch(getEmergencyGovernanceStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
