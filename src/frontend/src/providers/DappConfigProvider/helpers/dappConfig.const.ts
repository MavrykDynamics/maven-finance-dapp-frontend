import { getItemFromStorage } from 'utils/storage'
import { DappConfigContextStateType } from '../dappConfig.provider.types'
import { PreferencesState, LoadingState } from '../dappConfig.provider.types'

// global loading default state

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

// preferences default variables
export const mariGoldUrl = 'https://ghostnet.tezos.marigold.dev/'
export const ecadLabSUrl = 'https://ghostnet.ecadinfra.com'

export const RPC_NODE = 'selectedRpcNode'

export const preferencesDefaultState: PreferencesState = {
  themeSelected: getItemFromStorage('theme') || 'space',
  changeNodePopupOpen: false,
  sidebarOpened: false,
  RPC_NODES: [
    { title: 'ECADLABS', url: ecadLabSUrl, nodeLogoUrl: 'ECAD_logo.png', isUser: false },
    { title: 'MARIGOLD', url: mariGoldUrl, nodeLogoUrl: 'marigold_logo.png', isUser: false },
  ],
  REACT_APP_RPC_PROVIDER: ecadLabSUrl,
}

export const defaultLoadingState: LoadingState = {
  // isWertLoading – used for wert io payment system initialization
  isWertLoading: false,
  // isActiveFullScreenLoader – used for full screen rocket loader after operation confirmed
  isActiveFullScreenLoader: false,
  // isActionActive – user to track whether action is fullfilled with data update and we can unlock buttons
  isActionActive: false,
}

export const DEFAULT_DAPP_CONFIG_CONTEXT: DappConfigContextStateType = {
  maxLengths: DAPP_DEFAULT_MAX_LENGHTS,
  minimumStakedMvkBalance: 0,
  dappTotalValueLocked: null,
  xtzBakers: null,
  contractAddresses: DAPP_DEFAULT_CONTRACT_ADDRESSES,
  // TODO: set default address to null, when contracts are updated
  mvkFaucetAddress: 'KT1A6EJRMuz8TZWeSxaqvU2UsqxRjopvo8Nh',
  preferences: preferencesDefaultState,
  globalLoadingState: defaultLoadingState,
}
