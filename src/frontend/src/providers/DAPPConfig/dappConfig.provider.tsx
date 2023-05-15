import React, { useContext } from 'react'

// types
import { State, Props, DAPPConfigContext } from './dappConfig.types'

// consts
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
  defaultSatelliteDescriptionMaxLength,
  defaultSatelliteNameMaxLength,
  defaultSatelliteWebsiteMaxLength,
  defaultGovPurposeMaxLength,
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalDescriptionMaxLength,
  defaultProposalTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
  defaultAggregatorNameMaxLength,
} from './dappConfig.const'

export const dappContext = React.createContext<DAPPConfigContext>(undefined!)

export class DAPPConfigProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        council: {
          councilMemberImageMaxLength: defaultCouncilMemberImageMaxLength,
          councilMemberNameMaxLength: defaultCouncilMemberNameMaxLength,
          councilMemberWebsiteMaxLength: defaultCouncilMemberWebsiteMaxLength,
          requestPurposeMaxLength: defaultRequestPurposeMaxLength,
          requestTokenNameMaxLength: defaultRequestTokenNameMaxLength,
        },
        dataFeeds: {
          feedNameMaxLength: defaultAggregatorNameMaxLength,
        },
        emergencyGovernance: {
          proposalTitleMaxLength: defaultProposalTitleMaxLength,
          proposalDescMaxLength: defaultProposalDescriptionMaxLength,
        },
        governance: {
          proposalDescriptionMaxLength: defaultProposalDescriptionMaxLength,
          proposalInvoiceMaxLength: defaultProposalInvoiceMaxLength,
          proposalMetadataTitleMaxLength: defaultProposalMetadataTitleMaxLength,
          proposalSourceCodeMaxLength: defaultProposalSourceCodeMaxLength,
          proposalTitleMaxLength: defaultProposalTitleMaxLength,
        },
        governanceSatellite: {
          purposeMaxLength: defaultGovPurposeMaxLength,
        },
        satelliteDelegation: {
          satelliteNameMaxLength: defaultSatelliteNameMaxLength,
          satelliteDescriptionMaxLength: defaultSatelliteDescriptionMaxLength,
          satelliteWebsiteMaxLength: defaultSatelliteWebsiteMaxLength,
        },
        // actions
        initializeDappConfigData: this.initializeDappConfigData,
      },
    }
  }

  initializeDappConfigData = (data: DAPPConfigContext) => {
    this.setState({
      context: {
        ...this.state.context,
        ...data,
      },
    })
  }

  render(): React.ReactNode {
    return <dappContext.Provider value={this.state.context}>{this.props.children}</dappContext.Provider>
  }
}

export const useDAPPConfigContext = () => {
  const context = useContext(dappContext)

  if (!context) {
    throw new Error('DAPPConfigContext should be used withing DAPPConfig provider')
  }

  return context
}

export default DAPPConfigProvider
