import DAPPConfigProvider from './dappConfig.provider'

type Council = {
  councilMemberImageMaxLength: number
  councilMemberNameMaxLength: number
  councilMemberWebsiteMaxLength: number
  requestPurposeMaxLength: number
  requestTokenNameMaxLength: number
}

type DataFeeds = {
  feedNameMaxLength: number
}

type EmergencyGovernance = {
  proposalTitleMaxLength: number
  proposalDescMaxLength: number
}

type Governance = {
  proposalDescriptionMaxLength: number
  proposalInvoiceMaxLength: number
  proposalMetadataTitleMaxLength: number
  proposalSourceCodeMaxLength: number
  proposalTitleMaxLength: number
}

type GovernanceSatellite = {
  purposeMaxLength: number
}

type SatelliteDelegation = {
  satelliteNameMaxLength: number
  satelliteDescriptionMaxLength: number
  satelliteWebsiteMaxLength: number
}

export type DAPPConfigContext = {
  council: Council
  dataFeeds: DataFeeds
  emergencyGovernance: EmergencyGovernance
  governance: Governance
  governanceSatellite: GovernanceSatellite
  satelliteDelegation: SatelliteDelegation
  // actions
  initializeDappConfigData: InstanceType<typeof DAPPConfigProvider>['initializeDappConfigData']
}

export type State = {
  context: DAPPConfigContext
}

export type Props = {
  children: React.ReactNode
}
