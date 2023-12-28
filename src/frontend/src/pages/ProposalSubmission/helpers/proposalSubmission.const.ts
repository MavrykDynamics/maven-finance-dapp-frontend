import {ProposalStatus} from 'providers/ProposalsProvider/helpers/proposals.const'
import {ProposalRecordType} from 'providers/ProposalsProvider/helpers/proposals.types'
import {Governance_Proposal} from 'utils/__generated__/graphql'
import {ProposalValidityObj} from '../ProposalSubmission.types'

// CONSTS
export const PROPOSAL_BYTE = {
  encoded_code: '',
  id: 1,
  internal_id: 0,
  title: '',
  code_description: '',
  order: 1,
  isUnderTheDrop: false,
  isLocalBytes: true,
  governance_proposal: {} as Governance_Proposal,
  governance_proposal_id: 0,
}

export const DEFAULT_PROPOSAL: ProposalRecordType = {
  id: -1,
  proposerId: '',
  governanceId: '',
  droppedTime: '',
  executionTime: '',
  defeatedTime: '',
  status: ProposalStatus.UNLOCKED,
  title: '',
  description: '',
  invoice: '',
  sourceCode: '',
  proposalUpVotesMvnTotal: 0,
  yayVotesMvnTotal: 0,
  nayVotesMvnTotal: 0,
  passVotesMvnTotal: 0,
  minQuorumPercentage: 0,
  quorumMvnTotal: 0,
  currentCycleEndLevel: 0,
  cycle: 0,
  successReward: 0,
  proposalData: [],
  votes: [],
  proposalPayments: [],
  currentRoundProposal: true,
  paymentProcessed: false,
  anyCanExecute: false,
  anyCanPay: false,
  executed: false,
  locked: false,
}

export const DEFAULT_PROPOSAL_VALIDATION: ProposalValidityObj = {
  title: '',
  description: '',
  invoice: '',
  successMVKReward: '',
  invoiceTable: '',
  sourceCode: '',
  bytesValidation: [],
  paymentsValidation: [],
}
