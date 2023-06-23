import React, { useContext } from 'react'

// types
import { State, Props, DAPPConfigContext } from './dappConfig.types'
import { GetMaxlenghtsQueryQuery, MvkFaucetQuery } from 'utils/__generated__/graphql'

// consts
import { defaultSatelliteMinimumStakedMvk } from './dappConfig.const'
import { DAPP_DEFAULT_MAX_LENGHTS } from './dappConfig.const'
import { getXTZBakers } from './helpers/getXtzBakers'

export const dappContext = React.createContext<DAPPConfigContext>(undefined!)

/** */
export class DAPPConfigProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        // data
        maxLengths: DAPP_DEFAULT_MAX_LENGHTS,
        xtzBakers: null,
        // TODO: set default address to null, when contracts are updated
        mvkFaucetAddress: 'KT1A6EJRMuz8TZWeSxaqvU2UsqxRjopvo8Nh',
        minimumStakedMvkBalance: defaultSatelliteMinimumStakedMvk,
        // actions
        updateMaxLengths: this.updateMaxLengths,
        updateXtzBakers: this.updateXtzBakers,
        updateMVKFaucetAddress: this.updateMVKFaucetAddress,
      },
    }
  }

  updateMaxLengths = (data: GetMaxlenghtsQueryQuery) => {
    const {
      council_member_image_max_length,
      council_member_name_max_length,
      council_member_website_max_length,
      request_purpose_max_length,
      request_token_name_max_length,
    } = data.council[0]
    const { proposal_desc_max_length, proposal_title_max_length } = data.emergency_governance[0]
    const { satellite_description_max_length, satellite_name_max_length, satellite_website_max_length } =
      data.delegation[0]
    const {
      proposal_description_max_length,
      proposal_invoice_max_length,
      proposal_metadata_title_max_length,
      proposal_source_code_max_length,
      proposal_title_max_length: gov_proposal_title_max_length,
    } = data.governance[0]

    const newMaxLengths: DAPPConfigContext['maxLengths'] = {
      council: {
        councilMemberImageMaxLength: council_member_image_max_length,
        councilMemberNameMaxLength: council_member_name_max_length,
        councilMemberWebsiteMaxLength: council_member_website_max_length,
        requestPurposeMaxLength: request_purpose_max_length,
        requestTokenNameMaxLength: request_token_name_max_length,
      },
      dataFeeds: {
        feedNameMaxLength: data.governance_satellite[0].gov_purpose_max_length,
      },
      emergencyGovernance: {
        proposalTitleMaxLength: proposal_title_max_length,
        proposalDescMaxLength: proposal_desc_max_length,
      },
      governance: {
        proposalDescriptionMaxLength: proposal_description_max_length,
        proposalInvoiceMaxLength: proposal_invoice_max_length,
        proposalMetadataTitleMaxLength: proposal_metadata_title_max_length,
        proposalSourceCodeMaxLength: proposal_source_code_max_length,
        proposalTitleMaxLength: gov_proposal_title_max_length,
      },
      governanceSatellite: {
        purposeMaxLength: data.governance_satellite[0].gov_purpose_max_length,
      },
      satelliteDelegation: {
        satelliteNameMaxLength: satellite_name_max_length,
        satelliteDescriptionMaxLength: satellite_description_max_length,
        satelliteWebsiteMaxLength: satellite_website_max_length,
      },
    }

    this.setState({
      context: {
        ...this.state.context,
        maxLengths: newMaxLengths,
      },
    })
  }

  updateMVKFaucetAddress = (mvkData: MvkFaucetQuery) => {
    const address = mvkData.mvk_faucet[0]?.address ?? null

    this.setState({
      context: {
        ...this.state.context,
        mvkFaucetAddress: address,
      },
    })
  }

  updateXtzBakers = async () => {
    const xtzBakers = await getXTZBakers()

    this.setState({
      context: {
        ...this.state.context,
        xtzBakers,
      },
    })
  }

  /** */
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
