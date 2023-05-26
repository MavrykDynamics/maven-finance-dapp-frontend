import { SatellitesProviderClass } from './satellites.provider'
import { normallizeSatellite, getSatelliteVotings } from './helpers/Satellites.normalizer'
import { State as ReduxState } from 'reducers'
import { TokenType } from 'utils/TypesAndInterfaces/General'

import {
  SatelliteAggregatorOraclesSubscription,
  SatelliteDataSubSubscription,
  SatelliteEmergencyGovernanceDataSubscription,
  SatelliteGovernanceCycleSubscription,
  SatelliteGovernanceFinancialRequestSubscription,
  SatelliteGovernanceProposalDataSubscription,
} from 'utils/__generated__/graphql'
import { AppDispatch } from 'app/App.controller'

export type SatellitesContext = {
  satelliteMapper: Record<string, ReturnType<typeof normallizeSatellite>>
  activeSatellitesIds: string[]
  allSatellitesIds: string[]
  oraclesIds: string[]
  isLoaded: boolean
  // actions
  updateSatellitesContext: InstanceType<typeof SatellitesProviderClass>['updateSatellitesContext']
  // redux actions
  delegate: InstanceType<typeof SatellitesProviderClass>['delegate']
  undelegate: InstanceType<typeof SatellitesProviderClass>['undelegate']
  distributeProposalRewards: InstanceType<typeof SatellitesProviderClass>['distributeProposalRewards']
}

export type State = {
  context: SatellitesContext
}

export type Props = {
  children: React.ReactNode
  contractAddresses: ReduxState['contractAddresses']
  wallet: ReduxState['wallet']
  dispatch: AppDispatch
}

// additional types
export type SatellitesStorage = SatelliteDataSubSubscription &
  SatelliteGovernanceCycleSubscription &
  SatelliteAggregatorOraclesSubscription &
  SatelliteGovernanceFinancialRequestSubscription &
  SatelliteEmergencyGovernanceDataSubscription &
  SatelliteGovernanceProposalDataSubscription
export type SatelliteRecordType = ReturnType<typeof normallizeSatellite>
export type SatelliteMapper = Record<string, ReturnType<typeof normallizeSatellite>>

export enum SatelliteStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  BANNED = 2,
  INACTIVE = 3,
}

export type SatelliteVotingsType = ReturnType<typeof getSatelliteVotings>
export type SatelliteVoteType =
  | SatelliteVotingsType['satelliteActionVotes'][number]
  | SatelliteVotingsType['emergencyGovernanceVotes'][number]
  | SatelliteVotingsType['financialRequestsVotes'][number]
  | SatelliteVotingsType['proposalVotingHistory'][number]

export type SatelliteGovernanceTransfer = {
  to_: string //this is a contract address
  amount: number
  token: TokenType
}

export type SatellitesSubsSkipsType = {
  skipSatelliteData?: string
  skipGovProposal?: string
  skipEmergencyGov?: string
  skipFinancialRequest?: string
  skipAggregatorOracles?: string
  skipSatelliteCycle?: string
}
