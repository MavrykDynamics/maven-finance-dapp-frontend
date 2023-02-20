import type { Satellite, Delegation } from '../generated/graphqlTypes'
import { getSatelliteVotings, normallizeSatellite } from '../../pages/Satellites/helpers/Satellites.normalizer'

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

export type SatelliteRecordType = ReturnType<typeof normallizeSatellite>
export type SatelliteVotingsType = ReturnType<typeof getSatelliteVotings>
export type SatelliteVoteType =
  | SatelliteVotingsType['satelliteActionVotes'][number]
  | SatelliteVotingsType['emergencyGovernanceVotes'][number]
  | SatelliteVotingsType['financialRequestsVotes'][number]
  | SatelliteVotingsType['proposalVotingHistory'][number]

// TODO: check if i need this
export type TokenType = 'FA12' | 'FA2' | 'TEZ'
export type SatelliteGovernanceTransfer = {
  to_: string //this is a contract address
  amount: number
  token: TokenType
}

export type SatelliteRecordGraphQl = Omit<Satellite, '__typename'>
export type DelegationGraphQl = Omit<Delegation, '__typename'>
