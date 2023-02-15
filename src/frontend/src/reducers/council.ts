import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { CouncilActions, CouncilMembers, CouncilMaxLength } from '../utils/TypesAndInterfaces/Council'
import { GET_COUNCIL_STORAGE, GET_COUNCIL_ACTIONS, GET_COUNCIL_MEMBERS } from '../pages/Council/Council.actions'
import {
  GET_BREAK_GLASS_COUNCIL_ACTIONS,
  GET_BREAK_GLASS_COUNCIL_MEMBERS,
} from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
} from 'app/App.components/Input/Input.constants'

export type CouncilState = {
  councilMaxLength: CouncilMaxLength
  councilMembers: CouncilMembers
  councilActions: {
    allPendingActions: CouncilActions
    notMyPendingActions: CouncilActions
    myPendingActions: CouncilActions
    allPastActions: CouncilActions
    myPastActions: CouncilActions
  }
  breakGlassCouncilMembers: CouncilMembers
  breakGlassCouncilActions: {
    allPendingActions: CouncilActions
    notMyPendingActions: CouncilActions
    myPendingActions: CouncilActions
    allPastActions: CouncilActions
    myPastActions: CouncilActions
  }
}

const councilDefaultState: CouncilState = {
  councilMaxLength: {
    councilMemberImageMaxLength: defaultCouncilMemberImageMaxLength,
    councilMemberNameMaxLength: defaultCouncilMemberNameMaxLength,
    councilMemberWebsiteMaxLength: defaultCouncilMemberWebsiteMaxLength,
    requestPurposeMaxLength: defaultRequestPurposeMaxLength,
    requestTokenNameMaxLength: defaultRequestTokenNameMaxLength,
  },
  councilMembers: [],
  councilActions: {
    allPendingActions: [],
    notMyPendingActions: [],
    myPendingActions: [],
    allPastActions: [],
    myPastActions: [],
  },
  breakGlassCouncilMembers: [],
  breakGlassCouncilActions: {
    allPendingActions: [],
    notMyPendingActions: [],
    myPendingActions: [],
    allPastActions: [],
    myPastActions: [],
  },
}

export function council(state = councilDefaultState, action: Action) {
  switch (action.type) {
    case GET_COUNCIL_STORAGE:
      return {
        ...state,
        // TODO: add storage
        councilMaxLength: action.councilMaxLength,
      }
    case GET_COUNCIL_MEMBERS:
      return {
        ...state,
        councilMembers: action.councilMembers,
      }
    case GET_COUNCIL_ACTIONS:
      return {
        ...state,
        councilActions: {
          ...state.councilActions,
          ...action.councilActions,
        },
      }
    case GET_BREAK_GLASS_COUNCIL_MEMBERS:
      return {
        ...state,
        breakGlassCouncilMembers: action.breakGlassCouncilMembers,
      }
    case GET_BREAK_GLASS_COUNCIL_ACTIONS:
      return {
        ...state,
        breakGlassCouncilActions: {
          ...state.breakGlassCouncilActions,
          ...action.breakGlassCouncilActions,
        },
      }
    default:
      return state
  }
}
