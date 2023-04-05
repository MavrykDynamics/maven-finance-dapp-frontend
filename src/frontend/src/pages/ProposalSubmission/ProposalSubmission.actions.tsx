// helpres
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'

// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { SubmitProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { State } from 'reducers'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { PaymentsDataChangesType, ProposalDataChangesType } from './ProposalSybmittion.types'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const submitProposal =
  (form: SubmitProposalForm, fee: number) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const { title, description, ipfs, sourceCode } = form
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
      const query = await contract?.methods.propose(title, description, ipfs, sourceCode).send({ amount: fee })

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      await query?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))
      await dispatch(getGovernanceStorage())
      await dispatch(getSatellitesStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('submitProposal error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const dropProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Drop proposal...', 'Please wait 30s'))

    await (await contract?.methods.dropProposal(proposalId).send())?.confirmation()

    dispatch(showToaster(SUCCESS, 'Proposal Droped.', 'All good :)'))
    await dispatch(toggleActionLoader(false))

    await dispatch(getGovernanceStorage())
    await dispatch(getSatellitesStorage())
  } catch (error) {
    console.error('dropProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const lockProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))

    await (await contract?.methods.lockProposal(proposalId).send())?.confirmation()

    await dispatch(toggleActionLoader(false))
    await dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))

    await dispatch(getGovernanceStorage())
    await dispatch(getSatellitesStorage())
  } catch (error) {
    console.error('lockProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

// method for update proposal data (bytes and payment)
export const updateProposalData =
  (
    proposalId: number,
    bytesChanges?: ProposalDataChangesType | null,
    paymentChanges?: PaymentsDataChangesType | null,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    if (!bytesChanges?.length && !paymentChanges?.length) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', "Don't have changes to save"))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)

      if (!contract) {
        throw new Error(`No contract provided`)
      }

      try {
        const tezos = await DAPP_INSTANCE.tezos()
        const operationEstimate = await tezos.estimate.transfer(
          contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges).toTransferParams(),
        )

        console.log('operationEstimate', operationEstimate)
      } catch (e) {
        console.log('estimate error', e)
      }

      await dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))
      await dispatch(toggleActionLoader(true))

      const query = await contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges).send()
      await query?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Proposal updated.', 'All good :)'))
      await dispatch(toggleActionLoader(false))

      await dispatch(getGovernanceStorage())
      await dispatch(getSatellitesStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }
