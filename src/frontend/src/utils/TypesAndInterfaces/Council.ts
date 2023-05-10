import {
  Council,
  Council_Action,
  Council_Action_Signer,
  Council_Council_Member,
  Break_Glass_Action,
  Break_Glass_Action_Signer,
} from '../generated/graphqlTypes'
import { normalizeCouncilMembers, normalizeMaxLength } from '../../pages/Council/Council.helpers'

export type CouncilGraphQL = Omit<Council, '__typename'>
export type CouncilMaxLength = ReturnType<typeof normalizeMaxLength>

export type CouncilMemberGraphQL = Omit<Council_Council_Member, 'council' | 'council_id'>
export type CouncilMembers = ReturnType<typeof normalizeCouncilMembers>

export type CouncilActionGraphQL = Pick<Break_Glass_Action, 'break_glass_id'> &
  Omit<Council_Action, '__typename' | 'council' | 'signers'> & {
    signers: (Pick<Break_Glass_Action_Signer, 'break_glass_action' | 'break_glass_action_id'> &
      Omit<Council_Action_Signer, '__typename' | 'council' | 'signers'>)[]
  }

export type CouncilActionsType = {
  allPendingActions: number[]
  notMyPendingActions: number[]
  myPendingActions: number[]
  allPastActions: number[]
  myPastActions: number[]
  actionsMapper: Record<number, CouncilActionType>
}

export type CouncilActionType = {
  actionType: string
  councilId: string
  executed: boolean
  councilSize: number
  id: number
  initiatorId: string
  signersCount: number
  startDatetime: string
  parameters: {
    id: number
    name: string
    value: string
  }[]
}
