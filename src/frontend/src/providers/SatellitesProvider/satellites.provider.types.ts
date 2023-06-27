import { normallizeSatellite, getSatelliteVotings } from './helpers/Satellites.normalizer'
import { TokenType } from 'utils/TypesAndInterfaces/General'

export type SatellitesContext = {
  // data
  satelliteMapper: Record<string, ReturnType<typeof normallizeSatellite>>
  activeSatellitesIds: string[]
  allSatellitesIds: string[]
  oraclesIds: string[]

  // additional data
  isLoading: boolean

  // api
  setSatelliteAddressToSubsctibe: (satelliteAddress: string | null) => void
}

export type SatellitesCtxState = Pick<
  SatellitesContext,
  'satelliteMapper' | 'activeSatellitesIds' | 'allSatellitesIds' | 'oraclesIds'
>

// additional types
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
  // | SatelliteVotingsType['emergencyGovernanceVotes'][number]
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

export type SatellitesStatisticsSubsSkipsType = {
  skipOracleCount?: string
  skipActiveSatellitesCount?: string
  skipTotalDelegatedMVK?: string
}
