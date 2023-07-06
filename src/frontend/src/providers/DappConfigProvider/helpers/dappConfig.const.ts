import { DappConfigContextStateType } from '../dappConfig.provider.types'

// default max length
export const defaultCouncilMemberImageMaxLength = 500
export const defaultCouncilMemberNameMaxLength = 25
export const defaultCouncilMemberWebsiteMaxLength = 500
export const defaultRequestPurposeMaxLength = 800
export const defaultRequestTokenNameMaxLength = 20
export const defaultSatelliteDescriptionMaxLength = 800
export const defaultSatelliteImageMaxLength = 500
export const defaultSatelliteNameMaxLength = 20
export const defaultSatelliteWebsiteMaxLength = 500
export const defaultSatelliteMinimumStakedMvk = 100
export const defaultGovPurposeMaxLength = 800
export const defaultProposalInvoiceMaxLength = 50
export const defaultProposalMetadataTitleMaxLength = 110
export const defaultProposalDescriptionMaxLength = 800
export const defaultProposalTitleMaxLength = 70
export const defaultProposalSourceCodeMaxLength = 100_000
export const defaultAggregatorNameMaxLength = 35
export const defaultTreasuryNameMaxLength = 25
export const defaultOraclePeerIdMaxLength = 52

export const DAPP_DEFAULT_MAX_LENGHTS = {
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
}

export const DAPP_DEFAULT_CONTRACT_ADDRESSES = {
  farmsAddress: null,
  farmsFactoryAddress: null,
  delegationAddress: null,
  doormanAddress: null,
  mvkTokenAddress: null,
  governanceAddress: null,
  governanceFinancialAddress: null,
  emergencyGovernanceAddress: null,
  breakGlassAddress: null,
  councilAddress: null,
  treasuryAddress: null,
  treasuryFactoryAddress: null,
  vestingAddress: null,
  governanceSatelliteAddress: null,
  feedsFactoryAddress: null,
  feedsAddress: null,
  governanceProxyAddress: null,
  lendingControllerAddress: null,
  vaultFactoryAddress: null,
}

export const DEFAULT_DAPP_CONFIG_CONTEXT: DappConfigContextStateType = {
  maxLengths: DAPP_DEFAULT_MAX_LENGHTS,
  minimumStakedMvkBalance: 0,
  xtzBakers: null,
  contractAddresses: DAPP_DEFAULT_CONTRACT_ADDRESSES,
  // TODO: set default address to null, when contracts are updated
  mvkFaucetAddress: 'KT1A6EJRMuz8TZWeSxaqvU2UsqxRjopvo8Nh',
}
