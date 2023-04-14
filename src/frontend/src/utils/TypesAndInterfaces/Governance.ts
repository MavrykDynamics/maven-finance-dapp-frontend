import type {
  Governance,
  Governance_Satellite,
  Governance_Financial_Request,
  Governance_Proposal,
  Governance_Satellite_Action,
} from '../generated/graphqlTypes'

import { normalizeFinancialRequests } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { normalizeProposal } from 'pages/Governance/actions/governanceNormalizers'
import { normalizerSatelliteGovernance } from 'pages/SatelliteGovernance/SatelliteGovernance.helpers'

// Governance proposals types
export type GovernanceProposalGraphQL = Omit<Governance_Proposal, '__typename'>
export type ProposalRecordType = ReturnType<typeof normalizeProposal>

export enum ProposalStatus {
  EXECUTED = 'EXECUTED',
  DEFEATED = 'DEFEATED',
  ONGOING = 'ONGOING',
  WAITING = 'WAITING',
  DROPPED = 'DROPPED',
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  TIMELOCK = 'TIMELOCK',
}

// Governance config types
export type GovernanceGraphQL = Omit<Governance, '__typename'>
export type GovernancePhaseType = typeof GovPhases.PROPOSAL | typeof GovPhases.VOTING | typeof GovPhases.TIMELOCK

export enum GovPhases {
  PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIMELOCK = 'TIMELOCK',
}

// Satellite governance types
export type SatelliteGovernance = ReturnType<typeof normalizerSatelliteGovernance>
export type GovernanceSatelliteGraphQL = Omit<Governance_Satellite, '__typename'>
export type GovernanceSatelliteActionGraphQL = Omit<Governance_Satellite_Action, '__typename'>

// Financical request types
export type GovernanceFinancialRequestGraphQL = Omit<Governance_Financial_Request, '__typename'>
export type FinancialRequestRecord = ReturnType<typeof normalizeFinancialRequests>[number]
