import React from 'react'
import ContractStatusesProvider from './contractStatus.provider'
import {
  BreakGlassAggregatorFactorySubscription,
  BreakGlassAggregatorSubscription,
  BreakGlassDelegationSubscription,
  BreakGlassDoormanSubscription,
  BreakGlassTreasuryFactorySubscription,
  BreakGlassTreasurySubscription,
  BreakGlassfarmFactorySubscription,
  BreakGlassfarmSubscription,
  GlasssBrokenStatusSubscription,
  Maybe,
  WhiteListDevelopersSubscription,
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

export interface ContractStatusesContext {
  contractStatuses: ContractStatusesStorage
  updateContractStatuses: InstanceType<typeof ContractStatusesProvider>['updateContractStatuses']
}

export type State = {
  context: ContractStatusesContext
}

export type Props = {
  children: React.ReactNode
}

// hooks
export type ContractStatusesConfigSkips = {
  skipGlassBroken?: SubscriptionSkipType
  skipWhitelistDevelopers?: SubscriptionSkipType
}
export type ContractStatusesConfigType = GlasssBrokenStatusSubscription & WhiteListDevelopersSubscription

export type ContractStatusesType = BreakGlassfarmSubscription &
  BreakGlassAggregatorFactorySubscription &
  BreakGlassAggregatorSubscription &
  BreakGlassDelegationSubscription &
  BreakGlassDoormanSubscription &
  BreakGlassfarmFactorySubscription &
  BreakGlassTreasuryFactorySubscription &
  BreakGlassTreasurySubscription
