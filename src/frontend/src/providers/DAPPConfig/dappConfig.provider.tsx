import React, { useContext } from 'react'

// types
import {
  State,
  Props,
  DAPPConfigContext,
  SatelliteDelegation,
  GovernanceMaxLength,
  GovernanceSatelliteMaxLength,
  EmergencyGovernanceMaxLength,
  DataFeedsMaxLength,
  CouncilMaxLength,
} from './dappConfig.types'
import { GetMaxlenghtsQueryQuery } from 'utils/__generated__/graphql'

// consts
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
  defaultSatelliteImageMaxLength,
  defaultSatelliteDescriptionMaxLength,
  defaultSatelliteNameMaxLength,
  defaultSatelliteWebsiteMaxLength,
  defaultSatelliteMinimumStakedMvk,
  defaultGovPurposeMaxLength,
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalDescriptionMaxLength,
  defaultProposalTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
  defaultAggregatorNameMaxLength,
} from './dappConfig.const'
import { calcWithoutPrecision } from 'utils/calcFunctions'

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
          satelliteImageMaxLength: defaultSatelliteImageMaxLength,
          minimumStakedMvkBalance: defaultSatelliteMinimumStakedMvk,
        },
        // loader indicator
        isDappLoading: true,
        // actions
        initializeDappConfigData: this.initializeDappConfigData,
      },
    }
  }

  initializeDappConfigData = (data: GetMaxlenghtsQueryQuery) => {
    const {
      council_member_image_max_length,
      council_member_name_max_length,
      council_member_website_max_length,
      request_purpose_max_length,
      request_token_name_max_length,
    } = data.council[0]
    const { proposal_desc_max_length, proposal_title_max_length } = data.emergency_governance[0]
    const {
      satellite_description_max_length,
      satellite_image_max_length,
      satellite_name_max_length,
      satellite_website_max_length,
      minimum_smvk_balance,
    } = data.delegation[0]
    const {
      proposal_description_max_length,
      proposal_invoice_max_length,
      proposal_metadata_title_max_length,
      proposal_source_code_max_length,
      proposal_title_max_length: gov_proposal_title_max_length,
    } = data.governance[0]

    const council: CouncilMaxLength = {
      councilMemberImageMaxLength: council_member_image_max_length,
      councilMemberNameMaxLength: council_member_name_max_length,
      councilMemberWebsiteMaxLength: council_member_website_max_length,
      requestPurposeMaxLength: request_purpose_max_length,
      requestTokenNameMaxLength: request_token_name_max_length,
    }

    const dataFeeds: DataFeedsMaxLength = {
      feedNameMaxLength: data.governance_satellite[0].gov_purpose_max_length,
    }

    const emergencyGovernance: EmergencyGovernanceMaxLength = {
      proposalTitleMaxLength: proposal_title_max_length,
      proposalDescMaxLength: proposal_desc_max_length,
    }

    const governance: GovernanceMaxLength = {
      proposalDescriptionMaxLength: proposal_description_max_length,
      proposalInvoiceMaxLength: proposal_invoice_max_length,
      proposalMetadataTitleMaxLength: proposal_metadata_title_max_length,
      proposalSourceCodeMaxLength: proposal_source_code_max_length,
      proposalTitleMaxLength: gov_proposal_title_max_length,
    }

    const governanceSatellite: GovernanceSatelliteMaxLength = {
      purposeMaxLength: data.governance_satellite[0].gov_purpose_max_length,
    }

    const satelliteDelegation: SatelliteDelegation = {
      satelliteNameMaxLength: satellite_name_max_length,
      satelliteDescriptionMaxLength: satellite_description_max_length,
      satelliteWebsiteMaxLength: satellite_website_max_length,
      satelliteImageMaxLength: satellite_image_max_length,
      minimumStakedMvkBalance: calcWithoutPrecision(minimum_smvk_balance),
    }

    this.setState({
      context: {
        ...this.state.context,
        council,
        dataFeeds,
        emergencyGovernance,
        governance,
        governanceSatellite,
        satelliteDelegation,
        isDappLoading: false,
      },
    })
  }

  render(): React.ReactNode {
    console.log(this.state.context)
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
