import React, { useContext } from 'react'

import { State, Props, ContractStatusesContext, ContractStatusesType } from './contractStatus.provider.types'
import { normalizeBreakGlassStatuses } from './helpers/normalizeBreakGlass'

export const contractStatusContext = React.createContext<ContractStatusesContext>(undefined!)

/**
 *
 */
export class ContractStatusesProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        contractStatuses: [],
        updateContractStatuses: this.updateContractStatuses,
      },
    }
  }

  updateContractStatuses = (contractStatusesStorage: ContractStatusesType) => {
    this.setState({
      context: {
        ...this.state.context,
        contractStatuses: normalizeBreakGlassStatuses(contractStatusesStorage),
      },
    })
  }

  /**
   *
   */
  render(): React.ReactNode {
    return (
      <contractStatusContext.Provider value={this.state.context}>{this.props.children}</contractStatusContext.Provider>
    )
  }
}

export const useContractStatusesContext = () => {
  const context = useContext(contractStatusContext)

  if (!context) {
    throw new Error('breakGlassContext should be used withing BreakGlassProvider')
  }

  return context
}

export default ContractStatusesProvider
