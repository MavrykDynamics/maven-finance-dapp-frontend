import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

import { normalizeVestingStorage } from './Treasury.normalizer'
import { AppDispatch } from '../../app/App.controller'
import { VESTING_STORAGE_QUERY, VESTING_STORAGE_QUERY_NAME, VESTING_STORAGE_QUERY_VARIABLE } from 'gql/queries'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const SET_TREASURY_STORAGE = 'SET_TREASURY_STORAGE'

export const GET_VESTING_STORAGE = 'GET_VESTING_STORAGE'
export const getVestingStorage = () => async (dispatch: AppDispatch) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      VESTING_STORAGE_QUERY,
      VESTING_STORAGE_QUERY_NAME,
      VESTING_STORAGE_QUERY_VARIABLE,
    )
    const vestingStorage = normalizeVestingStorage(storage?.vesting?.[0])

    dispatch({
      type: GET_VESTING_STORAGE,
      vestingStorage: vestingStorage,
    })
  } catch (error) {
    console.log('%c ----- error getVestingStorage', 'color:red', error)
  }
}
