import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { CouncilActions, CouncilMembers, CouncilMaxLength } from '../utils/TypesAndInterfaces/Council'
import {
  GET_COUNCIL_STORAGE,
  GET_COUNCIL_PENDING_ACTIONS,
  GET_COUNCIL_PAST_ACTIONS,
  GET_COUNCIL_MEMBERS,
} from '../pages/Council/Council.actions'
import {
  GET_BREAK_GLASS_COUNCIL_MEMBERS,
  GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS,
  GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS,
} from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
} from 'app/App.components/Input/Input.constants'

export type CouncilState = {
  config: {
    councilMaxLength: CouncilMaxLength
  }
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
  isStorageLoaded: boolean
  isCouncilMembersLoaded: boolean
  isCouncilPendingActionsLoaded: boolean
  isCouncilPastActionsLoaded: boolean
  isBreakGlassCouncilMembersLoaded: boolean
  isBreakGlassCouncilPendingActionsLoaded: boolean
  isBreakGlassCouncilPastActionsLoaded: boolean
}

const councilDefaultState: CouncilState = {
  config: {
    councilMaxLength: {
      councilMemberImageMaxLength: defaultCouncilMemberImageMaxLength,
      councilMemberNameMaxLength: defaultCouncilMemberNameMaxLength,
      councilMemberWebsiteMaxLength: defaultCouncilMemberWebsiteMaxLength,
      requestPurposeMaxLength: defaultRequestPurposeMaxLength,
      requestTokenNameMaxLength: defaultRequestTokenNameMaxLength,
    },
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
  isStorageLoaded: false,
  isCouncilMembersLoaded: false,
  isCouncilPendingActionsLoaded: false,
  isCouncilPastActionsLoaded: false,
  isBreakGlassCouncilMembersLoaded: false,
  isBreakGlassCouncilPendingActionsLoaded: false,
  isBreakGlassCouncilPastActionsLoaded: false,
}

export function council(state = councilDefaultState, action: Action) {
  switch (action.type) {
    case GET_COUNCIL_STORAGE:
      return {
        ...state,
        config: {
          ...state.config,
          councilMaxLength: action.councilMaxLength,
        },
        isStorageLoaded: true,
      }
    case GET_COUNCIL_MEMBERS:
      return {
        ...state,
        councilMembers: action.councilMembers,
        isCouncilMembersLoaded: true,
      }
    case GET_COUNCIL_PENDING_ACTIONS:
      return {
        ...state,
        councilActions: {
          ...state.councilActions,
          allPendingActions: action.councilActions.allPendingActions,
          notMyPendingActions: action.councilActions.notMyPendingActions,
          myPendingActions: action.councilActions.myPendingActions,
        },
        isCouncilPendingActionsLoaded: true,
      }
    case GET_COUNCIL_PAST_ACTIONS:
      return {
        ...state,
        councilActions: {
          ...state.councilActions,
          allPastActions: action.councilActions.allPastActions,
          myPastActions: action.councilActions.myPastActions,
        },
        isCouncilPastActionsLoaded: action.isCouncilPastActionsLoaded,
      }
    case GET_BREAK_GLASS_COUNCIL_MEMBERS:
      return {
        ...state,
        breakGlassCouncilMembers: action.breakGlassCouncilMembers,
        isBreakGlassCouncilMembersLoaded: true,
      }
    case GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS:
      return {
        ...state,
        breakGlassCouncilActions: {
          ...state.breakGlassCouncilActions,
          allPendingActions: action.breakGlassCouncilActions.allPendingActions,
          notMyPendingActions: action.breakGlassCouncilActions.notMyPendingActions,
          myPendingActions: action.breakGlassCouncilActions.myPendingActions,
        },
        isBreakGlassCouncilPendingActionsLoaded: true,
      }
    case GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS:
      return {
        ...state,
        breakGlassCouncilActions: {
          ...state.breakGlassCouncilActions,
          allPastActions: action.breakGlassCouncilActions.allPastActions,
          myPastActions: action.breakGlassCouncilActions.myPastActions,
        },
        isBreakGlassCouncilPastActionsLoaded: action.isBreakGlassCouncilPastActionsLoaded,
      }
    default:
      return state
  }
}
