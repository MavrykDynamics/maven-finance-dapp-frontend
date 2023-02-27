import { MichelsonMap } from '@taquito/taquito'
import { GET_DELEGATION_STORAGE } from 'pages/Satellites/Satellites.actions'
import { GET_SATELLITE_BY_ADDRESS } from '../pages/SatelliteDetails/SatelliteDetails.actions'
import {
  DelegateRecord,
  DelegationStorage,
  ParticipationMetrics,
  SatelliteRecord,
  SatelliteStatus,
} from '../utils/TypesAndInterfaces/Delegation'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export const DELEGATE = 'DELEGATE'
export const UNDELEGATE = 'UNDELEGATE'
export const SATELLITE_ACTION = 'SATELLITE_ACTION'

export interface DelegationState {
  type?: typeof DELEGATE | typeof UNDELEGATE | typeof SATELLITE_ACTION
  delegationStorage: DelegationStorage
  amount?: number
  error?: object
  currentSatellite: SatelliteRecord
  participationMetrics: ParticipationMetrics
}

const defaultDelegationStorage: DelegationStorage = {
  satelliteLedger: [],
  config: {
    maxSatellites: 1000,
    delegationRatio: 10000,
    minimumStakedMvkBalance: 10000,
    satelliteNameMaxLength: 400,
    satelliteDescriptionMaxLength: 400,
    satelliteImageMaxLength: 400,
    satelliteWebsiteMaxLength: 400,
  },
  delegateLedger: new MichelsonMap<string, DelegateRecord>(),
  breakGlassConfig: {
    delegateToSatelliteIsPaused: false,
    undelegateFromSatelliteIsPaused: false,
    registerAsSatelliteIsPaused: false,
    unregisterAsSatelliteIsPaused: false,
    updateSatelliteRecordIsPaused: false,
    distributeRewardPaused: false,
  },
  numberActiveSatellites: 0,
  oraclesAmount: 0,
  totalDelegatedMVK: 0,
  activeSatellites: [],
}

export const DEFAULT_SATELLITE = {
  status: SatelliteStatus.SUSPENDED,
  delegationRatio: 0,
  accuracy: 0,
  address: '',
  description: '',
  website: '',
  participation: 0,
  image: '',
  mvkBalance: 0,
  name: '',
  sMvkBalance: 0,
  delegatorCount: 0,
  satelliteFee: 0,
  totalDelegatedAmount: 0,
  oracleRecords: [],
  isSatelliteReady: false,
  currentlyRegistered: false,
}

const delegationDefaultState: DelegationState = {
  delegationStorage: defaultDelegationStorage,
  amount: 0,
  currentSatellite: DEFAULT_SATELLITE,
  participationMetrics: {
    pollParticipation: 0,
    proposalParticipation: 0,
  },
}

export function delegation(state = delegationDefaultState, action: Action) {
  switch (action.type) {
    case GET_DELEGATION_STORAGE:
      return {
        ...state,
        delegationStorage: action.delegationStorage,
      }
    case GET_SATELLITE_BY_ADDRESS:
      return {
        ...state,
        type: SATELLITE_ACTION,
        currentSatellite: action.currentSatellite,
      }
    default:
      return state
  }
}
