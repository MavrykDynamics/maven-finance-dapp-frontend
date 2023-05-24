import { SatellitesProviderClass } from './satellites.provider'
import { normallizeSatellite } from './helpers/Satellites.normalizer'
import { State as ReduxState } from 'reducers'

import { SatellitesStorageQuery } from 'utils/__generated__/graphql'
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

export type SatellitesStorage = SatellitesStorageQuery
export type SatelliteRecordType = ReturnType<typeof normallizeSatellite>
export type SatelliteMapper = Record<string, ReturnType<typeof normallizeSatellite>>
