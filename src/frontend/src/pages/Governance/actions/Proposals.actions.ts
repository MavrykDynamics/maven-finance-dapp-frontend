import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { getGovernanceStorage } from './GovernanseData.actions'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'

import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { CONTRACT_ERROR_CODES } from '../../../utils/error_codes'
import { toSentenceCase } from '../../../utils/toSentenceCase'
import { TezosOperationError, isTezosContractError } from 'errors/error'

const DEFAULT_TEZOS_ERROR = {
  message: 'Something went wrong',
  description: 'Something went wrong, you are not allowed to continue current operation',
}

//TODO: finish implementing execution estimation
export const estimateExecution = async (
  tezosOperation: any,
): Promise<{ minimalFeeMutez: number; totalCost: number; error?: any }> => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    // @ts-ignore
    const operationEstimate = await tezos?.estimate.transfer(tezosOperation)
    return operationEstimate
  } catch (e) {
    const _error = e as TezosOperationError
    const isTezosError = isTezosContractError(e)
    if (isTezosError) {
      const errorCode = Number(_error.message) ? Number(_error.message) : null
      let error = errorCode !== null ? CONTRACT_ERROR_CODES.get(errorCode) : null
      if (error) error.description = toSentenceCase(error.description)

      return {
        minimalFeeMutez: 0,
        totalCost: 0,
        error,
      }
    }

    return {
      minimalFeeMutez: 0,
      totalCost: 0,
      error: DEFAULT_TEZOS_ERROR,
    }
  }
}

export const proposalRoundVote = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Proposal Vote executing...', ACTION_START_MESSAGE_TEXT))

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

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Voting done', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    console.error('proposalRoundVote error: ', error)
    if (error instanceof Error) {
      await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

export const votingRoundVote = (vote: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.votingRoundVote(vote).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Voting...', ACTION_START_MESSAGE_TEXT))

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

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Voting done', ACTION_COMPLETION_MESSAGE_TEXT))
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
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

export const executeProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.executeProposal(proposalId).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Request Execute Proposal round start...', ACTION_START_MESSAGE_TEXT))

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

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Request confirmed', ACTION_COMPLETION_MESSAGE_TEXT))
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

export const processProposalPayment = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.processProposalPayment(proposalId).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Process Proposal Payment round start...', ACTION_START_MESSAGE_TEXT))

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

          await dispatch(hideToaster())
          await dispatch(
            showToaster(TOASTER_SUCCESS, 'Process Proposal Payment confirmed', ACTION_COMPLETION_MESSAGE_TEXT),
          )
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
