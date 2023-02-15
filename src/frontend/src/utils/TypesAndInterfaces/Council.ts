import type { Council, Council_Action } from '../generated/graphqlTypes'
import { noralizeCouncilStorage, normalizeCouncilActions } from '../../pages/Council/Council.helpers'

export type CouncilActions = ReturnType<typeof normalizeCouncilActions>
export type CouncilStorage = ReturnType<typeof noralizeCouncilStorage>

export type CouncilGraphQL = Omit<Council, '__typename'>
export type CouncilActionRecordhQL = Omit<Council_Action, '__typename'>

export type CouncilMemberMaxLength = {
  nameMaxLength: number
  websiteMaxLength: number
}

export type RequestPurposeMaxLength = { purposeMaxLength: number }
export type RequestTokenNameMaxLength = { tokenNameMaxLength: number }
