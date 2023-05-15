// helpres, actions
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// consts
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

// types
import type { AppDispatch, GetState } from '../../app/App.controller'
import { SubmitProposalForm } from '../../utils/TypesAndInterfaces/Forms'
import { State } from 'reducers'
import { PaymentsDataChangesType, ProposalDataChangesType } from './ProposalSubmittion.types'

export const submitProposal =
  (
    form: SubmitProposalForm,
    fee: number,
    proposalBytes: ProposalDataChangesType,
    proposalPayments?: PaymentsDataChangesType,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const { title, description, ipfs, sourceCode } = form
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
      const transaction = await contract?.methods
        .propose(title, description, ipfs, sourceCode, proposalBytes, proposalPayments)
        .send({ amount: fee })

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Submitting proposal...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getGovernanceStorage())
            await dispatch(getSatellitesStorage())

            // Add here call for update data actions
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Proposal Submitted.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('submitProposal error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

export const dropProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.dropProposal(proposalId).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Drop proposal...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getGovernanceStorage())
          await dispatch(getSatellitesStorage())

          // Add here call for update data actions
          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Proposal dropped.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('dropProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

export const lockProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.lockProposal(proposalId).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Locking proposal...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getGovernanceStorage())
          await dispatch(getSatellitesStorage())

          // Add here call for update data actions
          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Proposal locked.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('lockProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
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
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
      const transaction = await contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Updating proposal...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getGovernanceStorage())
            await dispatch(getSatellitesStorage())

            // Add here call for update data actions
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Proposal updated.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
