import {
  GET_BREAK_GLASS_COUNCIL_MEMBER,
  GET_BREAK_GLASS_ACTION_PENDING_SIGNATURE,
  GET_PAST_BREAK_GLASS_COUNCIL_ACTION,
  GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION,
} from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'
import { BreakGlassCouncilMember, BreakGlassActions } from '../utils/TypesAndInterfaces/BreakGlass'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface BreakGlassCounsilState {
  breakGlassCouncilMember: BreakGlassCouncilMember
  breakGlassActionPendingAllSignature: BreakGlassActions
  breakGlassActionPendingSignature: BreakGlassActions
  breakGlassActionPendingMySignature: BreakGlassActions
  pastBreakGlassCouncilAction: BreakGlassActions
  myPastBreakGlassCouncilAction: BreakGlassActions
  config: {
    councilMemberNameMaxLength: number
    councilMemberWebsiteMaxLength: number
    councilMemberImageMaxLength: number
    isPendingPropagateBreakGlass: boolean
  }
}

const breakGlassDefaultState: BreakGlassCounsilState = {
  breakGlassCouncilMember: [],
  breakGlassActionPendingAllSignature: [],
  breakGlassActionPendingSignature: [],
  breakGlassActionPendingMySignature: [],
  pastBreakGlassCouncilAction: [],
  myPastBreakGlassCouncilAction: [],
  config: {
    councilMemberNameMaxLength: 400,
    councilMemberWebsiteMaxLength: 400,
    councilMemberImageMaxLength: 400,
    isPendingPropagateBreakGlass: false,
  },
}

export function breakGlassCounsil(state = breakGlassDefaultState, action: Action) {
  switch (action.type) {
    case GET_BREAK_GLASS_COUNCIL_MEMBER:
      return {
        ...state,
        breakGlassCouncilMember: action.breakGlassCouncilMember,
      }
    case GET_BREAK_GLASS_ACTION_PENDING_SIGNATURE:
      return {
        ...state,
        breakGlassActionPendingAllSignature: action.breakGlassActionPendingAllSignature,
        breakGlassActionPendingSignature: action.breakGlassActionPendingSignature,
        breakGlassActionPendingMySignature: action.breakGlassActionPendingMySignature,
        isPendingPropagateBreakGlass: action.isPendingPropagateBreakGlass,
      }
    case GET_PAST_BREAK_GLASS_COUNCIL_ACTION:
      return {
        ...state,
        pastBreakGlassCouncilAction: action.pastBreakGlassCouncilAction,
      }
    case GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION:
      return {
        ...state,
        myPastBreakGlassCouncilAction: action.myPastBreakGlassCouncilAction,
      }
    default:
      return state
  }
}
