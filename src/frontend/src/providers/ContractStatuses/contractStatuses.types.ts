import {
  BreakGlassAggregatorFactorySubscription,
  BreakGlassAggregatorSubscription,
  BreakGlassDelegationSubscription,
  BreakGlassDoormanSubscription,
  BreakGlassTreasuryFactorySubscription,
  BreakGlassTreasurySubscription,
  BreakGlassfarmFactorySubscription,
  BreakGlassfarmSubscription,
  Maybe,
} from 'utils/__generated__/graphql'

import { SubscriptionSkipType } from 'utils/api/apollo.consts'

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

export type ContractStatusesType = BreakGlassfarmSubscription &
  BreakGlassAggregatorFactorySubscription &
  BreakGlassAggregatorSubscription &
  BreakGlassDelegationSubscription &
  BreakGlassDoormanSubscription &
  BreakGlassfarmFactorySubscription &
  BreakGlassTreasuryFactorySubscription &
  BreakGlassTreasurySubscription

export type ContractStatusesConfigType = {
  isGlassBroken: boolean | null
  whitelistDevelopers: string[] | null
}

export type ContractStatusesContextStateType = {
  config: ContractStatusesConfigType
}

export type NullableContractStatusesContextStateType = DeepNullable<ContractStatusesContextStateType>

export type ContractStatusesContext = ContractStatusesContextStateType & {
  isLoading: boolean
}
