import { GET_SATELLITES_STORAGE, GET_SATELLITE_CONFIG } from 'pages/Satellites/Satellites.actions'
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'

export type SatellitesState = {
  config: {
    minimumStakedMvkBalance: number
    satelliteNameMaxLength: number
    satelliteDescriptionMaxLength: number
    satelliteWebsiteMaxLength: number
    isConfigLoaded: boolean
  }
  satelliteMapper: Record<string, SatelliteRecordType>
  activeSatellitesIds: Array<SatelliteRecordType['address']>
  allSatellitesIds: Array<SatelliteRecordType['address']>
  oraclesIds: Array<SatelliteRecordType['address']>
  isLoaded: boolean
}

const satellitesDefaultState: SatellitesState = {
  config: {
    minimumStakedMvkBalance: 0,
    satelliteNameMaxLength: 0,
    satelliteDescriptionMaxLength: 0,
    satelliteWebsiteMaxLength: 0,
    isConfigLoaded: false,
  },
  satelliteMapper: {},
  activeSatellitesIds: [],
  allSatellitesIds: [],
  oraclesIds: [],
  isLoaded: false,
}

export function satellites(state = satellitesDefaultState, action: any) {
  switch (action.type) {
    case GET_SATELLITES_STORAGE:
      return {
        ...state,
        satelliteMapper: action.satellitesMapper,
        activeSatellitesIds: action.activeSatellitesIds,
        allSatellitesIds: action.allSatellitesIds,
        oraclesIds: action.oraclesIds,
        isLoaded: true,
      }
    case GET_SATELLITE_CONFIG:
      return { ...state, config: { ...action.config, isConfigLoaded: true } }
    default:
      return state
  }
}
