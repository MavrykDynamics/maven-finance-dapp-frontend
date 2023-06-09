import DAPPConfigProvider from './dappConfig.provider'
import { XtzBakerType } from './helpers/getXtzBakers'

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

export type DAPPConfigContext = {
  maxLengths: {
    council: CouncilMaxLength
    dataFeeds: DataFeedsMaxLength
    emergencyGovernance: EmergencyGovernanceMaxLength
    governance: GovernanceMaxLength
    governanceSatellite: GovernanceSatelliteMaxLength
    satelliteDelegation: SatelliteDelegationMaxLength
  }
  mvkFaucetAddress: string | null
  xtzBakers: {
    dao: XtzBakerType
    mavrykDynamics: XtzBakerType
    otherBakers: Array<XtzBakerType>
  } | null
  // actions
  updateMaxLengths: InstanceType<typeof DAPPConfigProvider>['updateMaxLengths']
  updateMVKFaucetAddress: InstanceType<typeof DAPPConfigProvider>['updateMVKFaucetAddress']
  updateXtzBakers: InstanceType<typeof DAPPConfigProvider>['updateXtzBakers']
}

export type State = {
  context: DAPPConfigContext
}

export type Props = {
  children: React.ReactNode
}
