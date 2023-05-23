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

  updateSatellitesContext = (storage: SatellitesStorage) => {
    const { oraclesIds, activeSatellitesIds, allSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(storage)

    this.setState({
      context: {
        ...this.state.context,
        oraclesIds,
        activeSatellitesIds,
        allSatellitesIds,
        satelliteMapper,
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
