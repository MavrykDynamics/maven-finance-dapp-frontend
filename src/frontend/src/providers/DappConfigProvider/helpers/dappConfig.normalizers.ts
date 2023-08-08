import { GetContractAddressesQueryQuery } from 'utils/__generated__/graphql'
import { DappMaxLengths } from '../dappConfig.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'
import { DappConfigGqlType } from './dappConfig.schemes'

export const normalizerMaxLenghts = (data: DappConfigGqlType): DappMaxLengths => {
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

  return {
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
}

export const normalizeInitialConfigData = (indexerData: DappConfigGqlType) => {
  return {
    maxLenghts: normalizerMaxLenghts(indexerData),
    mvkFaucetAddress: indexerData.mvk_faucet[0]?.address ?? null,
    minimumStakedMvkBalance: convertNumberForClient({
      number: indexerData.delegation[0].minimum_smvk_balance,
      grade: MVK_DECIMALS,
    }),
  }
}

export const normalizeContractAddresses = (data: GetContractAddressesQueryQuery) => {
  return {
    farmsFactoryAddress: data.farm_factory[0].address,
    delegationAddress: data.delegation[0].address,
    doormanAddress: data.doorman[0].address,
    mvkTokenAddress: data.mvk_token[0].address,
    governanceAddress: data.governance[0].address,
    governanceFinancialAddress: data.governance_financial[0].address,
    emergencyGovernanceAddress: data.emergency_governance[0].address,
    breakGlassAddress: data.break_glass[0].address,
    councilAddress: data.council[0].address,
    treasuryAddress: data.mvk_token[0].address,
    treasuryFactoryAddress: data.treasury_factory[0].address,
    vestingAddress: data.vesting[0].address,
    governanceSatelliteAddress: data.governance_satellite[0].address,
    feedsFactoryAddress: data.aggregator_factory[0].address,
    feedsAddress: data.aggregator[0].address,
    lendingControllerAddress: data.lending_controller[0].address,
    vaultFactoryAddress: data.vault_factory[0].address,
  }
}
