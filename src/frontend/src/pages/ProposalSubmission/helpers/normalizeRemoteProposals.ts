import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { ProposalValidityObj, SubmittedProposalsMapper } from '../ProposalSubmission.types'
import { DEFAULT_PROPOSAL_VALIDATION } from './proposalSubmission.const'

export const normalizeProposalsForSubmitProposal = ({
  submissionProposalsIds,
  proposalsMapper,
}: {
  submissionProposalsIds: Array<number>
  proposalsMapper: Record<number, ProposalRecordType>
}): [number[], Record<number, ProposalRecordType>, Record<number, ProposalValidityObj>] => {
  const { keys, mapper, validityObj } = submissionProposalsIds.reduce<SubmittedProposalsMapper>(
    (acc, proposalId) => {
      const proposal = proposalsMapper[proposalId]
      acc.mapper[proposalId] = proposal
      acc.validityObj[proposalId] = {
        ...DEFAULT_PROPOSAL_VALIDATION,
        bytesValidation: proposal.proposalData.map((bytesPair) => ({
          validBytes: '',
          validTitle: '',
          validDescr: '',
          byteId: bytesPair.id,
        })),
        paymentsValidation: proposal.proposalPayments.map((payment) => ({
          token_amount: '',
          title: '',
          to__id: '',
          paymentId: payment.id,
        })),
      }
      acc.keys.push(proposal.id)
      return acc
    },
    { keys: [], mapper: {}, validityObj: {} },
  )

  return [keys, mapper, validityObj]
}
