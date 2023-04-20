import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { normalizeGovernanceStorage, normalizeProposals } from './Governance.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import {
  GOVERNANCE_STORAGE_QUERY,
  GOVERNANCE_STORAGE_QUERY_NAME,
  GOVERNANCE_STORAGE_QUERY_VARIABLE,
  CURRENT_ROUND_PROPOSALS_QUERY,
  CURRENT_ROUND_PROPOSALS_QUERY_NAME,
  CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE,
} from '../../gql/queries/getGovernanceStorage'
import { State } from '../../reducers'
import { ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER } from 'utils/constants'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FiancialRequest.actions'

export const SET_GOVERNANCE_PHASE = 'SET_GOVERNANCE_PHASE'
export const GET_GOVERNANCE_STORAGE = 'GET_GOVERNANCE_STORAGE'
export const SET_PAST_PROPOSALS = 'SET_PAST_PROPOSALS'
export const getGovernanceStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const { dipDupTokens } = getState().tokens
  try {
    const storage = await fetchFromIndexer(
      GOVERNANCE_STORAGE_QUERY,
      GOVERNANCE_STORAGE_QUERY_NAME,
      GOVERNANCE_STORAGE_QUERY_VARIABLE,
    )

    const convertedStorage = normalizeGovernanceStorage(storage, dipDupTokens)

    dispatch({
      type: GET_GOVERNANCE_STORAGE,
      governanceStorage: convertedStorage,
    })

    dispatch({
      type: SET_GOVERNANCE_PHASE,
      phase: convertedStorage.currentRound,
    })

    const pastProposals = convertedStorage.proposalLedger.reduce<Array<ProposalRecordType>>((acc, proposal) => {
      if (proposal.status === 1 || proposal.executed || !proposal.currentRoundProposal) {
        acc.push(proposal)
      }
      return acc
    }, [])

    dispatch({ type: SET_PAST_PROPOSALS, pastProposals })
  } catch (e) {
    console.error('getGovernanceStorage error: ', e)
  }
}

export const GET_CURRENT_ROUND_PROPOSALS = 'GET_CURRENT_ROUND_PROPOSALS'
export const getCurrentRoundProposals = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      CURRENT_ROUND_PROPOSALS_QUERY,
      CURRENT_ROUND_PROPOSALS_QUERY_NAME,
      CURRENT_ROUND_PROPOSALS_QUERY_VARIABLE,
    )

    const currentRoundProposals = normalizeProposals(storage.governance_proposal)

    dispatch({
      type: GET_CURRENT_ROUND_PROPOSALS,
      currentRoundProposals,
    })
  } catch (e) {
    console.error('getCurrentRoundProposals error: ', e)
  }
}

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

    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.proposalRoundVote(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Proposal Vote executing...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
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
// export const estimateExecution = async (
//   proposalId: number,
//   tezos: State['wallet']['tezos'],
//   govAddress: string,
// ): Promise<{ minimalFeeMutez: number; totalCost: number }> => {
//   try {
//     if (!tezos) {
//       throw new Error('no tezos provided')
//     }

//     const contract = await tezos?.wallet.at(govAddress)
//     console.log('contract', contract)

//     const operationEstimate = await tezos?.estimate.transfer(
//       contract.methods.executeProposal(proposalId).toTransferParams(),
//     )

//     console.log('operationEstimate', operationEstimate)
//     return operationEstimate
//   } catch (e) {
//     console.error('estimateExecution error', e)
//     return {
//       minimalFeeMutez: 0,
//       totalCost: 0,
//     }
//   }
// }

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

      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceFinancialAddress.address)
      const transaction = await contract?.methods.voteForRequest(requestId, vote).send()

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(getFinancialRequestStorage())
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
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
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.votingRoundVote(vote).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Voting...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Voting done', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
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

    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startProposalRound().send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Proposal round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
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

    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startProposalRound().send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Voting round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const getTimestampByLevel = async (level: number): Promise<string> => {
  if (level) {
    try {
      const timestamp = await (
        await fetch(`https://api.ghostnet.tzkt.io/v1/blocks/${level}/timestamp`, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
        })
      ).json()

      return timestamp
    } catch (error) {
      console.error('getTimestampByLevel', error)
    }
  }
  return ''
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

    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.startNextRound(executePastProposal).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Next round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
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
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.executeProposal(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Request Execute Proposal round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Request confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
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
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
    const transaction = await contract?.methods.processProposalPayment(proposalId).send()

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Process Proposal Payment round start...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Process Proposal Payment confirmed', 'All good :)'))
    await dispatch(getGovernanceStorage())
    await dispatch(getCurrentRoundProposals())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
