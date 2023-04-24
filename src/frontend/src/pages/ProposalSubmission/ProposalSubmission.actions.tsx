// helpres, actions
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// consts
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { SubmitProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { State } from 'reducers'
import { PaymentsDataChangesType, ProposalDataChangesType } from './ProposalSybmittion.types'

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
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

      const { title, description, ipfs, sourceCode } = form
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
      const transaction = await contract?.methods.propose(title, description, ipfs, sourceCode).send({ amount: fee })

      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getGovernanceStorage())
          await dispatch(getSatellitesStorage())
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))
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
    const transaction = await contract?.methods.dropProposal(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Drop proposal...', 'Please wait 30s'))

    await transaction.confirmation()

    // @ts-ignore don't have proper type to acees data, type has only methods
    const currentOperationLevel = transaction?.lastHead?.header?.level

    // refetch data we need
    await checkIndexerLevelAndRunDataUpdateCallback({
      callback: async () => {
        await dispatch(getGovernanceStorage())
        await dispatch(getSatellitesStorage())
      },
      currentOperationLevel,
    })

    await dispatch(showToaster(SUCCESS, 'Proposal Droped.', 'All good :)'))
    await dispatch(toggleActionLoader(false))
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
    const transaction = await contract?.methods.lockProposal(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Locking proposal...', 'Please wait 30s'))

    await transaction.confirmation()

    // @ts-ignore don't have proper type to acees data, type has only methods
    const currentOperationLevel = transaction?.lastHead?.header?.level

    // refetch data we need
    await checkIndexerLevelAndRunDataUpdateCallback({
      callback: async () => {
        await dispatch(getGovernanceStorage())
        await dispatch(getSatellitesStorage())
      },
      currentOperationLevel,
    })

    await dispatch(showToaster(SUCCESS, 'Proposal locked.', 'All good :)'))
    await dispatch(toggleActionLoader(false))
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
      await dispatch(showToaster(INFO, 'Updating proposal...', 'Please wait 30s'))
      await dispatch(toggleActionLoader(true))

      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)

      // TODO: if need uncomment, estimation for transaction
      // try {
      //   const tezos = await DAPP_INSTANCE.tezos()
      //   const operationEstimate = await tezos.estimate.transfer(
      //     contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges).toTransferParams(),
      //   )

      //   console.log('operationEstimate', operationEstimate)
      // } catch (e) {
      //   console.log('estimate error', e)
      // }

      const transaction = await contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges).send()
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getGovernanceStorage())
          await dispatch(getSatellitesStorage())
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Proposal updated.', 'All good :)'))
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }
