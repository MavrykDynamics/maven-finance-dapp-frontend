import React, { useContext } from 'react'

// types
import { State, Props, SatellitesContext, SatellitesStorage } from './satellites.provider.types'
import { normalizeSatellitesLedger } from './helpers/Satellites.normalizer'

export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export class SatellitesProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        satelliteMapper: {},
        activeSatellitesIds: [],
        allSatellitesIds: [],
        oraclesIds: [],
        isLoaded: false,
        // actions
        updateSatellitesContext: this.updateSatellitesContext,
      },
    }
  }

  updateSatellitesContext = (storage: SatellitesStorage, satelliteAddress = '') => {
    const { oraclesIds, activeSatellitesIds, allSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(storage)

    let _oraclesIds = oraclesIds
    let _activeSatellitesIds = activeSatellitesIds
    let _allSatellitesIds = allSatellitesIds
    let _satelliteMapper = satelliteMapper

    if (Boolean(satelliteAddress)) {
      _oraclesIds = [...new Set([...oraclesIds, ...this.state.context.oraclesIds])]
      _activeSatellitesIds = [...new Set([...activeSatellitesIds, ...this.state.context.activeSatellitesIds])]
      _allSatellitesIds = [...new Set([...allSatellitesIds, ...this.state.context.allSatellitesIds])]

      _satelliteMapper = { ...this.state.context.satelliteMapper, ..._satelliteMapper }
    }

    this.setState({
      context: {
        ...this.state.context,
        oraclesIds: _oraclesIds,
        activeSatellitesIds: _activeSatellitesIds,
        allSatellitesIds: _allSatellitesIds,
        satelliteMapper: _satelliteMapper,
        isLoaded: true,
      },
    })
  }

  render(): React.ReactNode {
    console.log(this.state.context, 'satellites context')
    return <satellitesContext.Provider value={this.state.context}>{this.props.children}</satellitesContext.Provider>
  }
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing Satellites provider')
  }

  return context
}

export default SatellitesProvider
