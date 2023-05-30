import React from 'react'
import BreakGlassProvider from './breakGlass.provider'
import { normalizeBreakGlass } from './helpers/normalizeBreakGlass'
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

export type BreakGlassStatusStorage = Array<{
  title: string
  type: string
  address: string
  admin: string
  lastUpdated?: Maybe<string>
  methods: Record<string, boolean>
}>

export type BreakGlassConfig = ReturnType<typeof normalizeBreakGlass>

export interface BreakGlassContext {
  breakGlassStatus: BreakGlassStatusStorage
  config: BreakGlassConfig
  // actions
  updateBreakGlassConfig: InstanceType<typeof BreakGlassProvider>['updateBreakGlassConfig']
  updateBreakGlassStatus: InstanceType<typeof BreakGlassProvider>['updateBreakGlassStatus']
}

export type State = {
  context: BreakGlassContext
}

export type Props = {
  children: React.ReactNode
}

// hooks
export type BreakGlassConfigType = GlasssBrokenStatusSubscription & WhiteListDevelopersSubscription

export type BreakGlassStatusType = BreakGlassfarmSubscription &
  BreakGlassAggregatorFactorySubscription &
  BreakGlassAggregatorSubscription &
  BreakGlassDelegationSubscription &
  BreakGlassDoormanSubscription &
  BreakGlassfarmFactorySubscription &
  BreakGlassTreasuryFactorySubscription &
  BreakGlassTreasurySubscription
