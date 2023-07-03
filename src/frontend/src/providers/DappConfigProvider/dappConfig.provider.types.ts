import { TransactionWalletOperation } from '@taquito/taquito'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'
import { StakeActionType } from 'providers/StakeProvider/stake.provider.types'
import { XtzBakerType } from './bakers/getXtzBakers'
import { UserActionsType } from 'providers/UserProvider/user.provider.types'

export type DappConfigContext = {
  // data
  currentIndexedLevel: number | null
  isLoading: boolean
  maxLengths: DappMaxLengths
  mvkFaucetAddress: string | null
  xtzBakers: {
    dao: XtzBakerType
    mavrykDynamics: XtzBakerType
    otherBakers: Array<XtzBakerType>
  } | null

  // methods
  setAction: (actionName: null | UserActionType) => void
}

export type DappConfigContextStateType = Pick<DappConfigContext, 'maxLengths' | 'mvkFaucetAddress' | 'xtzBakers'>


export type ActionTypes = StakeActionType | UserActionsType 

// TODO: dont forget to add other action names with their transfer to context
export type UserActionType = {
  actionName: ActionTypes
  toasterId: string
  operationLvl: number
}

export type ActionErrorReturnType = { actionSuccess: boolean; error: null | unknown }
export type ActionSuccessReturnType = {
  actionSuccess: boolean
  operation: TransactionWalletOperation | BatchWalletOperation
}

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
