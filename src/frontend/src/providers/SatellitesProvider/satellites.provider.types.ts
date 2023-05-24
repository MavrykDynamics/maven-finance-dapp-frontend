import { SatellitesProvider } from './satellites.provider'
import { normallizeSatellite } from './helpers/Satellites.normalizer'

import { SatellitesStorageQuery } from 'utils/__generated__/graphql'

export type SatellitesContext = {
  satelliteMapper: Record<string, ReturnType<typeof normallizeSatellite>>
  activeSatellitesIds: string[]
  allSatellitesIds: string[]
  oraclesIds: string[]
  isLoaded: boolean
  // actions
  updateSatellitesContext: InstanceType<typeof SatellitesProvider>['updateSatellitesContext']
}

export type State = {
  context: SatellitesContext
}

export type Props = {
  children: React.ReactNode
}

export type SatellitesStorage = SatellitesStorageQuery
