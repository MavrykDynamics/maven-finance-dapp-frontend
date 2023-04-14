import { fetchFromIndexer, fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import {
  GET_TREASURY_DATA,
  TREASURY_SMVK_QUERY,
  TREASURY_SMVK_QUERY_NAME,
  TREASURY_SMVK_QUERY_VARIABLES,
  TREASURY_STORAGE_QUERY_NAME,
  TREASURY_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getTreasuryStorage'

import { normalizeTreasury, normalizeTreasuryStorage, normalizeVestingStorage } from './Treasury.helpers'
import { AppDispatch, GetState } from '../../app/App.controller'
import { VESTING_STORAGE_QUERY, VESTING_STORAGE_QUERY_NAME, VESTING_STORAGE_QUERY_VARIABLE } from 'gql/queries'

export const GET_TREASURY_STORAGE = 'GET_TREASURY_STORAGE'
export const SET_TREASURY_STORAGE = 'SET_TREASURY_STORAGE'

export const fillTreasuryStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const {
      tokens: { tokensPrices },
    } = getState()
    const MVK_EXCHANGE_RATE = tokensPrices['mvk'] ?? 0

    // Get treasury addresses from gql
    const treasuryAddressesStorage = await fetchFromIndexer(
      GET_TREASURY_DATA,
      TREASURY_STORAGE_QUERY_NAME,
      TREASURY_STORAGE_QUERY_VARIABLE,
    )

    // Parse gql data to understandable data format
    const convertedStorage = normalizeTreasury(treasuryAddressesStorage)

    // Get sMVK assets in treasuries from gql
    const sMVKAmounts = await fetchFromIndexer(
      TREASURY_SMVK_QUERY,
      TREASURY_SMVK_QUERY_NAME,
      TREASURY_SMVK_QUERY_VARIABLES(convertedStorage.treasury.map(({ address }: { address: string }) => address)),
    )

    const normalizedTreasuryWithBalances = normalizeTreasuryStorage(
      sMVKAmounts?.mavryk_user,
      convertedStorage.treasury,
      MVK_EXCHANGE_RATE,
      tokensPrices,
    )

    dispatch({
      type: SET_TREASURY_STORAGE,
      treasuryStorage: normalizedTreasuryWithBalances,
      treasuryFactoryAddress: convertedStorage.treasuryFactoryAddress,
    })
  } catch (error) {
    console.log('%c ---- error getTreasuryStorage', 'color:red', error)
  }
}

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
