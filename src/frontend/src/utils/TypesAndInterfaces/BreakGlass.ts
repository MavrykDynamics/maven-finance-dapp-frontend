// type
import type {
  Break_Glass,
  Aggregator,
  Aggregator_Factory,
  Delegation,
  Doorman,
  Farm,
  Farm_Factory,
  Treasury,
  Treasury_Factory,
  Whitelist_Developer,
  Break_Glass_Council_Member,
  Break_Glass_Action,
  Maybe,
} from '../generated/graphqlTypes'

import {
  normalizeBreakGlassAction,
  normalizeBreakGlassCouncilMember,
} from 'pages/BreakGlassCouncil/BreakGlassCouncil.helpers'
import { normalizeBreakGlass } from '../../pages/BreakGlass/BreakGlass.helpers'

export type BreakGlassCouncilMember = ReturnType<typeof normalizeBreakGlassCouncilMember>
export type BreakGlassCouncilMemberGraphQL = Omit<Break_Glass_Council_Member, '__typename'>

export type BreakGlassActions = ReturnType<typeof normalizeBreakGlassAction>
export type BreakGlassActionGraphQL = Omit<Break_Glass_Action, '__typename'>

export type BreakGlassConfig = ReturnType<typeof normalizeBreakGlass>
export type BreakGlassStatusStorage = Array<{
  title: string
  type: string
  address: string
  admin: string
  lastUpdated?: Maybe<string>
  methods: Record<string, boolean>
}>

export type BreakGlassGraphQL = Omit<Break_Glass, '__typename'>
export type WhitelistDevGraphQL = Omit<Whitelist_Developer, '__typename'>

export type BreakGlassStatusGraphQL = {
  aggregator: Aggregator[]
  aggregator_factory: Aggregator_Factory[]
  delegation: Delegation[]
  doorman: Doorman[]
  farm: Farm[]
  farm_factory: Farm_Factory[]
  treasury: Treasury[]
  treasury_factory: Treasury_Factory[]
}
