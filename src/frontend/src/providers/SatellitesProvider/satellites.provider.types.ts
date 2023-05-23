import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'

export type SatellitesContext = {
  satelliteMapper: Record<string, SatelliteRecordType>
  activeSatellitesIds: Array<SatelliteRecordType['address']>
  allSatellitesIds: Array<SatelliteRecordType['address']>
  oraclesIds: Array<SatelliteRecordType['address']>
  isLoaded: boolean
}

export type State = {
  context: SatellitesContext
}

export type Props = {
  children: React.ReactNode
}
