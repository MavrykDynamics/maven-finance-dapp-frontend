import { MichelsonMap } from '@taquito/taquito'
import type { Satellite, Delegation } from '../generated/graphqlTypes'
import { Governance_Proposal, Maybe, Governance_Financial_Request } from '../generated/graphqlTypes'

import { FinancialRequestVote, ProposalVote } from './Governance'

import {
  getSatelliteVotings,
  normalizeDelegationStorage,
  normalizeSatelliteRecord,
  normalizeSatellitesLedger,
  normallizeSatellite,
} from '../../pages/Satellites/Satellites.helpers'

export enum SatelliteStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  BANNED = 2,
}

export const SatelliteStatusToText = {
  0: 'Active',
  1: 'Suspended',
  2: 'Banned',
}

export type NewSatelliteRecordType = ReturnType<typeof normallizeSatellite>
export type NewSatelliteVotingsType = ReturnType<typeof getSatelliteVotings>

export type SatelliteRecord = ReturnType<typeof normalizeSatelliteRecord>
export type SatelliteProposalVotingHistory = SatelliteRecord['proposalVotingHistory']
export type SatelliteVotingDataType =
  | SatelliteRecord['financialRequestsVotes'][number]
  | SatelliteRecord['proposalVotingHistory'][number]
  | SatelliteRecord['satelliteActionVotes'][number]
  | SatelliteRecord['emergencyGovernanceVotes'][number]

export type DelegationConfig = {
  maxSatellites: number
  delegationRatio: number
  minimumStakedMvkBalance: number
  satelliteNameMaxLength: number
  satelliteDescriptionMaxLength: number
  satelliteImageMaxLength: number
  satelliteWebsiteMaxLength: number
}

export type ParticipationMetrics = {
  pollParticipation: number
  proposalParticipation: number
}

export interface DelegationBreakGlassConfigType {
  delegateToSatelliteIsPaused: boolean
  undelegateFromSatelliteIsPaused: boolean
  registerAsSatelliteIsPaused: boolean
  unregisterAsSatelliteIsPaused: boolean
  updateSatelliteRecordIsPaused: boolean
  distributeRewardPaused: boolean
}

export interface DelegateRecord {
  satelliteAddress: string
  delegatedDateTime: Date | null
}

export type DelegationLedger = MichelsonMap<string, DelegateRecord>
export type TokenType = 'FA12' | 'FA2' | 'TEZ'

export type SatelliteGovernanceTransfer = {
  to_: string //this is a contract address
  amount: number
  token: TokenType
}

export type DelegationStorage = ReturnType<typeof normalizeDelegationStorage>
export type SatelliteRecordGraphQl = Omit<Satellite, '__typename'>
export type DelegationGraphQl = Omit<Delegation, '__typename'>
