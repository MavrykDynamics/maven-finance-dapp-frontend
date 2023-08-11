import { GetAllContractStatusesDataQuery, Maybe } from 'utils/__generated__/graphql'

import { SubscriptionSkipType } from 'utils/api/apollo.consts'
import { CONTRACT_STATUSES_ALL_SUB, CONTRACT_STATUSES_CONFIG_SUB } from './helpers/contractStatuses.consts'

export type ContractStatusesStorage = Array<{
  title: string
  type: string
  address: string
  admin: string
  lastUpdated?: Maybe<string>
  methods: Record<string, boolean>
}>

export type ContractStatusesConfigSkips = {
  skipGlassBroken?: SubscriptionSkipType
  skipWhitelistDevelopers?: SubscriptionSkipType
}

export type ContractStatusesType = GetAllContractStatusesDataQuery

export type ContractStatusesConfigType = {
  isGlassBroken: boolean
  whitelistDevelopers: string[]
}

export type ContractStatusesContextStateType = {
  config: ContractStatusesConfigType
  contractStatuses: ContractStatusesStorage
}

export type NullableContractStatusesContextStateType = DeepNullable<ContractStatusesContextStateType>

export type ContractStatusesContext = ContractStatusesContextStateType & {
  isLoading: boolean

  changeLoansSubscriptionsList: (newSkips: Partial<ContractStatusesSubsRecordType>) => void
}

export type ContractStatusesSubsType = typeof CONTRACT_STATUSES_CONFIG_SUB | typeof CONTRACT_STATUSES_ALL_SUB
export type ContractStatusesSubsRecordType = Record<ContractStatusesSubsType, boolean>
