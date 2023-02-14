import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  BREAK_GLASS_STATUS_QUERY,
  BREAK_GLASS_STATUS_QUERY_NAME,
  BREAK_GLASS_STATUS_QUERY_VARIABLE,
  BREAK_GLASS_CONFIG_QUERY,
  BREAK_GLASS_CONFIG_QUERY_NAME,
  BREAK_GLASS_CONFIG_QUERY_VARIABLE,
} from '../../gql/queries'
import { normalizeBreakGlass, normalizeBreakGlassStatus } from './BreakGlass.helpers'
import type { AppDispatch, GetState } from '../../app/App.controller'

export const GET_BREAK_GLASS_STORAGE = 'GET_BREAK_GLASS_STORAGE'
export const getBreakGlassConfig = () => async (dispatch: AppDispatch, getState: GetState) => {
  const configStorage = await fetchFromIndexer(
    BREAK_GLASS_CONFIG_QUERY,
    BREAK_GLASS_CONFIG_QUERY_NAME,
    BREAK_GLASS_CONFIG_QUERY_VARIABLE,
  )

  const config = normalizeBreakGlass(configStorage)

  dispatch({
    type: GET_BREAK_GLASS_STORAGE,
    config,
  })
}

export const GET_CONTRACT_STATUSES = 'GET_CONTRACT_STATUSES'
export const getContractStatuses = () => async (dispatch: AppDispatch, getState: GetState) => {
  const contractStatusesStorage = await fetchFromIndexer(
    BREAK_GLASS_STATUS_QUERY,
    BREAK_GLASS_STATUS_QUERY_NAME,
    BREAK_GLASS_STATUS_QUERY_VARIABLE,
  )

  const breakGlassStatus = normalizeBreakGlassStatus(contractStatusesStorage)

  dispatch({
    type: GET_CONTRACT_STATUSES,
    breakGlassStatus,
  })
}
