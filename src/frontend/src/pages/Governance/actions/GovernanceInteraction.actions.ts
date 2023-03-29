import { State } from 'reducers'
import { AppDispatch, GetState } from 'app/App.controller'

import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'

import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getGovernance } from './GovernanseData.actions'

export const proposalRoundVote = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Proposal Vote executing...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('proposalRoundVote error: ', error)
    if (error instanceof Error) {
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

// TODO: finish implementing execution estimation
export const estimateExecution = async (
  proposalId: number,
  tezos: State['wallet']['tezos'],
  govAddress: string,
): Promise<{ minimalFeeMutez: number; totalCost: number }> => {
  try {
    if (!tezos) {
      throw new Error('no tezos provided')
    }

    const contract = await tezos?.wallet.at(govAddress)
    console.log('contract', contract)

    const operationEstimate = await tezos?.estimate.transfer(
      contract.methods.executeProposal(proposalId).toTransferParams(),
    )

    console.log('operationEstimate', operationEstimate)
    return operationEstimate
  } catch (e) {
    console.error('estimateExecution error', e)
    return {
      minimalFeeMutez: 0,
      totalCost: 0,
    }
  }
}

export const votingRinancialRequestVote =
  (vote: string, requestId: number) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    try {
      if (!state.wallet.accountPkh) {
        dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
        return
      }

      if (state.loading.isActionLoading) {
        dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
        return
      }

      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceFinancialAddress.address)
      const transaction = await contract?.methods.voteForRequest(requestId, vote).send()

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
      await dispatch(getGovernance())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const votingRoundVote = (vote: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.votingRoundVote(vote).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const startProposalRound = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startProposalRound().send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Proposal round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const startVotingRound = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startProposalRound().send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Voting round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const startNextRound = (executePastProposal: boolean) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startNextRound(executePastProposal).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Next round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const executeProposal = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.executeProposal(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Execute Proposal round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const processProposalPayment = (proposalId: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.processProposalPayment(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Process Proposal Payment round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Process Proposal Payment confirmed', 'All good :)'))
    await dispatch(getGovernance())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
