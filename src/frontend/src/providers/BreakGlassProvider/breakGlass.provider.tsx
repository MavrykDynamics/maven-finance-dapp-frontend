import React, { useContext } from 'react'

// types
import { State, Props, BreakGlassContext, BreakGlassConfigType, BreakGlassStatusType } from './breakGlass.provider.type'
import { normalizeBreakGlass, normalizeBreakGlassStatus } from './helpers/normalizeBreakGlass'

export const breakGlassContext = React.createContext<BreakGlassContext>(undefined!)

export class BrealGlassProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        breakGlassStatus: [],
        config: {
          glassBroken: false,
          whitelistDev: [],
        },
        updateBreakGlassConfig: this.updateBreakGlassConfig,
        updateBreakGlassStatus: this.updateBreakGlassStatus,
      },
    }
  }

  updateBreakGlassConfig = (storage: BreakGlassConfigType) => {
    const config = normalizeBreakGlass(storage)

    this.setState({
      context: {
        ...this.state.context,
        config,
      },
    })
  }

  updateBreakGlassStatus = (contractStatusesStorage: BreakGlassStatusType) => {
    const breakGlassStatus = normalizeBreakGlassStatus(contractStatusesStorage)

    this.setState({
      context: {
        ...this.state.context,
        breakGlassStatus,
      },
    })
  }

  render(): React.ReactNode {
    console.log(this.state.context)
    return <breakGlassContext.Provider value={this.state.context}>{this.props.children}</breakGlassContext.Provider>
  }
}

export const useBreakGlassContext = () => {
  const context = useContext(breakGlassContext)

  if (!context) {
    throw new Error('breakGlassContext should be used withing BreakGlassProvider')
  }

  return context
}

export default BrealGlassProvider
