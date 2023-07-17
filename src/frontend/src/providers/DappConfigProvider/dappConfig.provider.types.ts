import { TransactionWalletOperation } from '@taquito/taquito'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'
import { StakeActionType } from 'providers/StakeProvider/stake.provider.types'
import { XtzBakerType } from './bakers/getXtzBakers'
import { normalizeContractAddresses } from './helpers/dappConfig.normalizers'
import { UserActionsType } from 'providers/UserProvider/user.provider.types'
import { SatelliteActionsType } from 'providers/SatellitesProvider/satellites.provider.types'
import { ExtendedError } from 'errors/error'
import { TezosWalletErrorPayload } from 'errors/error.type'
import { ThemeType } from 'consts/theme.const'
import { LoansActionsType } from 'providers/LoansProvider/loans.provider.types'
import { VaultsActionsType } from 'providers/VaultsProvider/vaults.provider.types'
import { ProposalActionsTypes } from 'providers/ProposalsProvider/helpers/proposals.types'

export type ActionTypes =
  | StakeActionType
  | UserActionsType
  | SatelliteActionsType
  | LoansActionsType
  | VaultsActionsType
  | ProposalActionsTypes

export type DappConfigContext = {
  // data
  maxLengths: DappMaxLengths
  mvkFaucetAddress: string | null
  minimumStakedMvkBalance: number
  contractAddresses: Record<DappContractAddressesKeysType, string | null>
  xtzBakers: {
    dao: XtzBakerType
    mavrykDynamics: XtzBakerType
    otherBakers: Array<XtzBakerType>
  } | null
  isLoading: boolean
  preferences: PreferencesState
  globalLoadingState: LoadingState

  // methods
  setAction: (actionName: null | UserActionType) => void
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

export type DappConfigContextStateType = Pick<
  DappConfigContext,
  | 'maxLengths'
  | 'mvkFaucetAddress'
  | 'xtzBakers'
  | 'minimumStakedMvkBalance'
  | 'contractAddresses'
  | 'preferences'
  | 'globalLoadingState'
>

export type UserActionType = {
  actionName: ActionTypes
  toasterId: string
  operationLvl: number
  callback?: () => void
}

export type ActionErrorReturnType = { actionSuccess: boolean; error: Error | ExtendedError | TezosWalletErrorPayload }
export type ActionSuccessReturnType = {
  actionSuccess: boolean
  operation: TransactionWalletOperation | BatchWalletOperation
}

// Contract Addresses type
export type DappContractAddressesType = ReturnType<typeof normalizeContractAddresses>
export type DappContractAddressesKeysType = keyof DappContractAddressesType

// MAX LENGHTS TYPES
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

// preferences

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

// loading state

export type LoadingState = {
  isActiveFullScreenLoader: boolean
  isActionActive: boolean
  isWertLoading: boolean
}
