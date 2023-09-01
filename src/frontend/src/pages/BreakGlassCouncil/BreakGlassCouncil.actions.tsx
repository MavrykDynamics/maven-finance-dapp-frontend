import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  ERROR,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY,
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY_NAME,
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY_VARIABLE,
  BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY,
  BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_NAME,
  BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_VARIABLE,
  BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY,
  BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME,
  BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE,
} from '../../gql/queries/getBreakGlassCouncilStorage'

// helpers
import {
  normalizeCouncilActions,
  normalizeCouncilMembers,
  PENDING_ACTIONS,
  PAST_ACTIONS,
} from 'pages/Council/Council.helpers'
import { parseDate } from 'utils/time'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// actions
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const timestamptz = parseDate({ time, timeFormat }) || undefined
export const CLEAR_MY_BREAK_GLASS_COUNCIL_ACTIONS = 'CLEAR_MY_BREAK_GLASS_COUNCIL_ACTIONS'

// getBreakGlassCouncilPendingActions
export const GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS = 'GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS'
export const getBreakGlassCouncilPendingActions = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state?.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY,
      BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME,
      BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE({ _gte: timestamptz }),
    )

    const breakGlassCouncil = storage?.break_glass_action || []

    const { allPendingActions, notMyPendingActions, myPendingActions, actionsMapper } = normalizeCouncilActions(
      breakGlassCouncil,
      PENDING_ACTIONS,
      accountPkh,
    )

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_PENDING_ACTIONS,
      breakGlassCouncilActions: {
        allPendingActions,
        notMyPendingActions,
        myPendingActions,
        actionsMapper,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getBreakGlassCouncilPastActions
export const GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS = 'GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS'
export const getBreakGlassCouncilPastActions = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state?.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY,
      BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_NAME,
      BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_VARIABLE({ _lt: timestamptz }),
    )

    const breakGlassCouncil = storage?.break_glass_action || []

    const { allPastActions, myPastActions, actionsMapper } = normalizeCouncilActions(
      breakGlassCouncil,
      PAST_ACTIONS,
      accountPkh,
    )

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_PAST_ACTIONS,
      breakGlassCouncilActions: {
        allPastActions,
        myPastActions,
        actionsMapper,
      },
      isBreakGlassCouncilPastActionsLoaded: Boolean(accountPkh),
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getBreakGlassCouncilMembers
export const GET_BREAK_GLASS_COUNCIL_MEMBERS = 'GET_BREAK_GLASS_COUNCIL_MEMBERS'
export const getBreakGlassCouncilMembers = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_MEMBERS_QUERY,
      BREAK_GLASS_COUNCIL_MEMBERS_QUERY_NAME,
      BREAK_GLASS_COUNCIL_MEMBERS_QUERY_VARIABLE,
    )

    const members = storage?.break_glass_council_member || []
    const breakGlassCouncilMembers = normalizeCouncilMembers(members)

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_MEMBERS,
      breakGlassCouncilMembers,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}
