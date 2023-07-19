import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { PaymentsDataChangesType, ProposalDataChangesType } from 'pages/ProposalSubmission/ProposalSubmission.types'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { SubmitProposalForm } from 'utils/TypesAndInterfaces/Forms'

export const submitProposal = async (
  governanceAddress: string,
  form: SubmitProposalForm,
  fee: number,
  proposalBytes: ProposalDataChangesType,
  proposalPayments: PaymentsDataChangesType,
  callback: (latestProposalId: number) => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const { title, description, invoice, sourceCode } = form
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const submitProposalMetaData = contract?.methods.propose(
      title,
      description,
      invoice,
      sourceCode,
      proposalBytes,
      proposalPayments.length ? proposalPayments : undefined,
    )

    // for dapp callback
    // await dispatch(getGovernanceStorage())

    // const usersLatestCreatedProposalId = await fetchFromIndexer(
    //   GOVERNANCE_LATEST_USER_PROPOSAL_QUERY,
    //   GOVERNANCE_LATEST_USER_PROPOSAL_NAME,
    //   GOVERNANCE_LATEST_USER_PROPOSAL_VARIABLE(state.wallet.accountPkh ?? ''),
    // )
    // const latestProposalId = usersLatestCreatedProposalId?.['governance_proposal']?.[0]?.id ?? DEFAULT_PROPOSAL.id

    // callback(latestProposalId)

    return await getEstimationResult(submitProposalMetaData, {
      params: { amount: fee },
      // callback: () => callback(latestProposalId)
    })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const dropProposal = async (
  governanceAddress: string,
  proposalId: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const dropProposalMetaData = await contract?.methods.dropProposal(proposalId)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

    return await getEstimationResult(dropProposalMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const lockProposal = async (
  governanceAddress: string,
  proposalId: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const lockProposalMetaData = contract?.methods.lockProposal(proposalId)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

    return await getEstimationResult(lockProposalMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// method for update proposal data (bytes and payment)
export const updateProposalData = async (
  governanceAddress: string,
  proposalId: number,
  bytesChanges?: ProposalDataChangesType | null,
  paymentChanges?: PaymentsDataChangesType | null,
) => {
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const updateProposalMetaData = contract.methods.updateProposalData(proposalId, bytesChanges, paymentChanges)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

    return await getEstimationResult(updateProposalMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
