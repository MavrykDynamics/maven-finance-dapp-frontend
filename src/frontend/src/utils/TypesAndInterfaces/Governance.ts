import type { Governance } from '../__generated__/graphql'

import { normalizeProposal } from 'pages/Governance/actions/governanceNormalizers'
import { Governance_Proposal } from 'utils/__generated__/graphql'

// Governance proposals types
export type GovernanceProposalGraphQL = Omit<Governance_Proposal, '__typename'>
export type ProposalRecordType = ReturnType<typeof normalizeProposal>

export const ProposalStatus = {
  EXECUTED: 'EXECUTED',
  DEFEATED: 'DEFEATED',
  ONGOING: 'ONGOING',
  WAITING: 'WAITING',
  DROPPED: 'DROPPED',
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED',
  TIMELOCK: 'TIMELOCK',
} as const

export const SatelliteGovActionStatus = {
  EXECUTED: 'EXECUTED',
  DEFEATED: 'DEFEATED',
  ONGOING: 'ONGOING',
  DROPPED: 'DROPPED',
} as const

export type ProposalStatusType = (typeof ProposalStatus)[keyof typeof ProposalStatus]
export type SatelliteGovActiobStatusType = (typeof SatelliteGovActionStatus)[keyof typeof SatelliteGovActionStatus]

// Governance config types
export type GovernanceGraphQL = Omit<Governance, '__typename'>
export type GovernancePhaseType = typeof GovPhases.PROPOSAL | typeof GovPhases.VOTING | typeof GovPhases.TIMELOCK

export enum GovPhases {
  PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIMELOCK = 'TIMELOCK',
}

// governance satellite snapshots
export type GovernanceSatelliteCycleData = Pick<Governance, 'cycle_id' | 'satellite_snapshots'>
