import { Maybe } from 'utils/__generated__/graphql'
import { CONTRACT_STATUSES_ALL_SUB, CONTRACT_STATUSES_CONFIG_SUB } from './helpers/contractStatuses.consts'

export type ContractStatusesStorage = Array<{
  title: string
  type: string
  address: string
  admin: string
  lastUpdated?: Maybe<string>
  methods: Record<string, boolean>
}>

export type ContractStatusesConfigType = {
  isGlassBroken: boolean
  areContractMethodsPaused: boolean
  whitelistDevelopers: string[]
}

export type ContractStatusesContextStateType = {
  config: ContractStatusesConfigType
  contractStatuses: ContractStatusesStorage
}

export type NullableContractStatusesContextStateType = DeepNullable<ContractStatusesContextStateType>

export type ContractStatusesContext = ContractStatusesContextStateType & {
  isLoading: boolean
  changeContractStatusesSubscriptionsList: (newSubs: Partial<ContractStatusesSubsRecordType>) => void
}

export type ContractStatusesSubsType = typeof CONTRACT_STATUSES_CONFIG_SUB | typeof CONTRACT_STATUSES_ALL_SUB
export type ContractStatusesSubsRecordType = Record<ContractStatusesSubsType, boolean>
