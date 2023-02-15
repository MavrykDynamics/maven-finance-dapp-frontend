import {
  Council,
  Council_Action,
  Council_Action_Signer,
  Break_Glass_Action,
  Break_Glass_Action_Signer,
} from '../generated/graphqlTypes'
import { normalizeCouncilStorage, normalizeCouncilActions } from '../../pages/Council/Council.helpers'

export type CouncilGraphQL = Omit<Council, '__typename'>
export type CouncilStorage = ReturnType<typeof normalizeCouncilStorage>
export type CouncilMembers = CouncilStorage['councilMembers']

export type CouncilActionGraphQL = Pick<Break_Glass_Action, 'break_glass_id'> &
  Omit<Council_Action, '__typename' | 'council' | 'signers'> & {
    signers: (Pick<Break_Glass_Action_Signer, 'break_glass_action' | 'break_glass_action_id'> &
      Omit<Council_Action_Signer, '__typename' | 'council' | 'signers'>)[]
  }
export type CouncilActions = ReturnType<typeof normalizeCouncilActions>

// max length
export type CouncilMemberMaxLength = {
  nameMaxLength: number
  websiteMaxLength: number
}
export type RequestPurposeMaxLength = { purposeMaxLength: number }
export type RequestTokenNameMaxLength = { tokenNameMaxLength: number }
