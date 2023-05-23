import React, { useContext } from 'react'

// types
import { State, Props, SatellitesContext } from './satellites.provider.types'

export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export class SatellitesProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {},
    }
  }

  render(): React.ReactNode {
    console.log(this.state.context)
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
