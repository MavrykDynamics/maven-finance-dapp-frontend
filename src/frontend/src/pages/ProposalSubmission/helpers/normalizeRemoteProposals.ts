import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { ProposalValidityObj, SubmittedProposalsMapper } from '../ProposalSubmission.types'
import { DEFAULT_PROPOSAL, DEFAULT_PROPOSAL_VALIDATION } from './proposalSubmission.const'
import { ProposalsContext } from 'providers/ProposalsProvider/proposals.provider.types'

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

// TODO: create util for unique merge
export const mergeRemoteProposalsWithClient = ({
  proposalKeys,
  mappedProposals,
  mappedValidation,
  proposalState,
  proposalsValidation,
  lastProposalIdFromOperation,
}: {
  proposalKeys: Array<number>
  mappedProposals: Record<number, ProposalRecordType>
  proposalState: Record<number, ProposalRecordType>
  mappedValidation: Record<number, ProposalValidityObj>
  proposalsValidation: Record<number, ProposalValidityObj>
  lastProposalIdFromOperation: null | number
}) => {
  const { mergedProposals, mergedProposalsValidation } = proposalKeys.reduce<{
    mergedProposals: Record<number, ProposalRecordType>
    mergedProposalsValidation: Record<number, ProposalValidityObj>
  }>(
    (acc, proposalId) => {
      const proposalFromRemote = mappedProposals[proposalId]
      const proposalValidationFromRemote = mappedValidation[proposalId]

      const proposalFromClient = proposalState[proposalId]
      const proposalValidationFromClient = proposalsValidation[proposalId]

      const isCurrentProposalUpdated = lastProposalIdFromOperation === proposalFromClient.id

      // if proposal exists on remote, but client don't have it, add it to client
      if (proposalFromRemote && !proposalFromClient) {
        acc.mergedProposals[proposalId] = proposalFromRemote
        acc.mergedProposalsValidation[proposalId] = proposalValidationFromRemote
        return acc
      }

      // if proposal exists on client and on remote merge their fields, to prevent clearing user enetered data
      acc.mergedProposals[proposalId] = {
        ...proposalFromRemote,
        proposalData: isCurrentProposalUpdated
          ? proposalFromRemote.proposalData
          : proposalFromRemote.proposalData
              .concat(proposalFromClient.proposalData)
              .reduce<{ ids: Record<string, boolean>; proposalData: ProposalRecordType['proposalData'] }>(
                (acc, byte) => {
                  if (acc.ids[byte.id]) return acc
                  acc.proposalData.push(byte)
                  acc.ids[byte.id] = true
                  return acc
                },
                {
                  ids: {},
                  proposalData: [],
                },
              ).proposalData,
        proposalPayments: isCurrentProposalUpdated
          ? proposalFromRemote.proposalPayments
          : proposalFromRemote.proposalPayments
              .concat(proposalFromClient.proposalPayments)
              .reduce<{ ids: Record<string, boolean>; proposalPayments: ProposalRecordType['proposalPayments'] }>(
                (acc, payment) => {
                  if (acc.ids[payment.id]) return acc
                  acc.proposalPayments.push(payment)
                  acc.ids[payment.id] = true
                  return acc
                },
                {
                  ids: {},
                  proposalPayments: [],
                },
              ).proposalPayments,
      }

      acc.mergedProposalsValidation[proposalId] = {
        ...proposalValidationFromRemote,
        bytesValidation: isCurrentProposalUpdated
          ? proposalValidationFromRemote.bytesValidation
          : proposalValidationFromRemote.bytesValidation
              .concat(proposalValidationFromClient.bytesValidation)
              .reduce<{ ids: Record<string, boolean>; bytesValidation: ProposalValidityObj['bytesValidation'] }>(
                (acc, validation) => {
                  if (acc.ids[validation.byteId]) return acc
                  acc.bytesValidation.push(validation)
                  acc.ids[validation.byteId] = true
                  return acc
                },
                {
                  ids: {},
                  bytesValidation: [],
                },
              ).bytesValidation,
        paymentsValidation: isCurrentProposalUpdated
          ? proposalValidationFromRemote.paymentsValidation
          : proposalValidationFromRemote.paymentsValidation
              .concat(proposalValidationFromClient.paymentsValidation)
              .reduce<{ ids: Record<string, boolean>; paymentsValidation: ProposalValidityObj['paymentsValidation'] }>(
                (acc, validation) => {
                  if (acc.ids[validation.paymentId]) return acc
                  acc.paymentsValidation.push(validation)
                  acc.ids[validation.paymentId] = true
                  return acc
                },
                {
                  ids: {},
                  paymentsValidation: [],
                },
              ).paymentsValidation,
      }

      return acc
    },
    {
      mergedProposals: {},
      mergedProposalsValidation: {},
    },
  )

  // user can create only 2 proposals, so if we have < 2 proposals created, add empty proposal to him, so he'll be able to fill and submit it
  if (proposalKeys.length < 2) {
    const defaultProposalFromState = proposalState[DEFAULT_PROPOSAL.id]
    const defaultProposalValidationFromState = proposalsValidation[DEFAULT_PROPOSAL.id]

    return {
      proposals: { ...mergedProposals, [DEFAULT_PROPOSAL.id]: defaultProposalFromState ?? DEFAULT_PROPOSAL },
      validation: {
        ...mergedProposalsValidation,
        [DEFAULT_PROPOSAL.id]: defaultProposalValidationFromState ?? DEFAULT_PROPOSAL_VALIDATION,
      },
    }
  } else {
    return {
      proposals: mergedProposals,
      validation: mergedProposalsValidation,
    }
  }
}
