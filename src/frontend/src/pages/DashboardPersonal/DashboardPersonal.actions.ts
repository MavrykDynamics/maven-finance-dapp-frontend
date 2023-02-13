import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getDelegationStorage, getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'

export const claimAllRewardsAction = () => async (dispatch: AppDispatch, getState: GetState) => {
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
    // const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Submitting emergency proposal...', 'Please wait 30s'))

    await dispatch(showToaster(SUCCESS, 'Emergency Proposal Submitted', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getOracleStorage())
    await dispatch(getDelegationStorage())
    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
