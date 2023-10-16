import { TransactionWalletOperation } from '@taquito/taquito'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'
import { StakeActionType } from 'providers/DoormanProvider/doorman.provider.types'
import { XtzBakerType } from './bakers/getXtzBakers'
import { normalizeContractAddresses } from './helpers/dappConfig.normalizers'
import { UserActionsType } from 'providers/UserProvider/user.provider.types'
import { SatelliteActionsType } from 'providers/SatellitesProvider/satellites.provider.types'
import { WalletErrorPayload } from 'errors/error.type'
import { ThemeType } from 'consts/theme.const'
import { LoansActionsType } from 'providers/LoansProvider/loans.provider.types'
import { VaultsActionsType } from 'providers/VaultsProvider/vaults.provider.types'
import { FinancialRequestsActionsTypes } from 'providers/FinancialRequestsProvider/financialRequests.provider.types'
import { WalletOperationError } from 'errors/error'
import { ProposalActionsTypes } from 'providers/ProposalsProvider/helpers/proposals.types'
import { SatellitesGovType } from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.types'
import { FarmActionsType } from 'providers/FarmsProvider/farms.provider.types'
import { BreakGlassCouncilActions, MavrykCouncilActions } from 'providers/CouncilProvider/helpers/council.types'
import { EGovProposalActionsType } from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider.types'
import { FeedsActionsType } from 'providers/DataFeedsProvider/dataFeeds.provider.types'

// ------ context types
export type DappConfigContextStateType = {
  maxLengths: DappMaxLengths
  canUseIpfs: boolean
  mvkFaucetAddress: string | null
  minimumStakedMvkBalance: number
  dappTotalValueLocked: number | null
  contractAddresses: Record<DappContractAddressesKeysType, string | null>
  xtzBakers: {
    dao: XtzBakerType
    mavrykDynamics: XtzBakerType
    otherBakers: Array<XtzBakerType>
  } | null
  preferences: PreferencesState
  globalLoadingState: LoadingState
}

export type DappConfigContextMethods = {
  // general
  handleCopyText: (testToCopy: string) => void
  // setter for dashboard tvl for the whole dapp
  setDappTotalValueLocked: (tvl: number) => void
  // preferences actions
  toggleTheme: (theme: ThemeType) => void
  toggleRPCNodePopup: (isOpened: boolean) => void
  selectNewRPCNode: (newRPCNode: string, isRemove?: boolean) => void
  setNewRPCNodes: (newRPCNodes: Array<RPCNodeType>, isRemove?: boolean) => void
  toggleSidebarCollapsing: (isOpened?: boolean) => void
  // loading actions
  toggleActionCompletion: (v: boolean) => void
  toggleWertLoader: (v: boolean) => void
  toggleActionFullScreenLoader: (v: boolean) => void
}

export type DappConfigContext = DappConfigContextStateType &
  DappConfigContextMethods & {
    isLoading: boolean

    // action handlers
    setAction: (actionName: null | UserActionType) => void
  }

// ------ dapp actions & action results types
export type ActionTypes =
  | StakeActionType
  | UserActionsType
  | SatelliteActionsType
  | LoansActionsType
  | VaultsActionsType
  | ProposalActionsTypes
  | FinancialRequestsActionsTypes
  | SatellitesGovType
  | FarmActionsType
  | BreakGlassCouncilActions
  | MavrykCouncilActions
  | EGovProposalActionsType
  | FeedsActionsType

export type UserActionType = {
  actionName: ActionTypes
  toasterId: string | null
  operationLvl: number
  callback?: () => void
}

export type ActionErrorReturnType = { actionSuccess: boolean; error: WalletErrorPayload | WalletOperationError }
export type ActionSuccessReturnType = {
  actionSuccess: boolean
  operation: TransactionWalletOperation | BatchWalletOperation
}

// ------ contract Addresses type
export type DappContractAddressesType = ReturnType<typeof normalizeContractAddresses>
export type DappContractAddressesKeysType = keyof DappContractAddressesType

// ------ max lenghts type
export type CouncilMaxLength = {
  councilMemberImageMaxLength: number
  councilMemberNameMaxLength: number
  councilMemberWebsiteMaxLength: number
  requestPurposeMaxLength: number
  requestTokenNameMaxLength: number
}

export type DataFeedsMaxLength = {
  feedNameMaxLength: number
}

export type EmergencyGovernanceMaxLength = {
  proposalTitleMaxLength: number
  proposalDescMaxLength: number
}

export type GovernanceMaxLength = {
  proposalDescriptionMaxLength: number
  proposalInvoiceMaxLength: number
  proposalMetadataTitleMaxLength: number
  proposalSourceCodeMaxLength: number
  proposalTitleMaxLength: number
}

export type GovernanceSatelliteMaxLength = {
  purposeMaxLength: number
}

export type SatelliteDelegationMaxLength = {
  satelliteNameMaxLength: number
  satelliteDescriptionMaxLength: number
  satelliteWebsiteMaxLength: number
}

export type DappMaxLengths = {
  council: CouncilMaxLength
  dataFeeds: DataFeedsMaxLength
  emergencyGovernance: EmergencyGovernanceMaxLength
  governance: GovernanceMaxLength
  governanceSatellite: GovernanceSatelliteMaxLength
  satelliteDelegation: SatelliteDelegationMaxLength
}

// ------ preferences types
export type RPCNodeType = {
  url: string
  title: string
  nodeLogoUrl?: string
  isUser: boolean
}

export type PreferencesState = {
  themeSelected: ThemeType
  changeNodePopupOpen: boolean
  RPC_NODES: Array<RPCNodeType>
  REACT_APP_RPC_PROVIDER: string
  sidebarOpened: boolean
}

// ------ loading types
export type LoadingState = {
  isActiveFullScreenLoader: boolean
  isActionActive: boolean
  isWertLoading: boolean
}
