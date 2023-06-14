import React, { useContext } from 'react'

// types
import type { ContractErrorContextType, ContractErrorPayload } from './contractError.type'
import { Props, State } from './contractError.type'
import { ContractErrorKeys, STAKING_FIELD } from './contractError.const'

export const contractErrorContext = React.createContext<ContractErrorContextType>(undefined!)

export default class ContractErrorProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        errors: {
          [STAKING_FIELD]: null,
        },
        addContractError: this.addContractError,
        removeContractError: this.removeContractError,
      },
    }
  }

  addContractError = (type: ContractErrorKeys, error: ContractErrorPayload) => {
    this.setState({
      context: {
        ...this.state.context,
        errors: { ...this.state.context.errors, [type]: error },
      },
    })
  }

  removeContractError = (type: ContractErrorKeys) => {
    this.setState({
      context: {
        ...this.state.context,
        errors: { ...this.state.context.errors, [type]: null },
      },
    })
  }

  render(): JSX.Element {
    return (
      <contractErrorContext.Provider value={this.state.context}>{this.props.children}</contractErrorContext.Provider>
    )
  }
}

export const useContractErrorContext = () => {
  const context = useContext(contractErrorContext)
  if (!context) {
    throw new Error('contract error context should be used within ContractErrorProvider')
  }
  return context
}
