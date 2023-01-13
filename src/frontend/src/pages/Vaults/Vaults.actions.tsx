import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
  VAULTS_STORAGE_QUERY,
  VAULTS_QUERY_NAME,
  VAULTS_QUERY_VARIABLE,
  VAULTS_QUERY,
} from 'gql/queries/getVaultsStorage'
import { normalizeVaultsStorage, normalizeVaults } from './Vaults.helpers'

export const GET_VAULTS_STORAGE = 'GET_VAULTS_STORAGE'
export const getVaultsStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      VAULTS_STORAGE_QUERY,
      VAULTS_STORAGE_QUERY_NAME,
      VAULTS_STORAGE_QUERY_VARIABLE,
    )

    const normallaziedVaultsStorage = normalizeVaultsStorage(storage)

    dispatch({
      type: GET_VAULTS_STORAGE,
      vaultsList: normallaziedVaultsStorage,
    })
  } catch (e) {
    console.error('getVaultsStorage error: ', e)
  }
}

export const GET_VAULTS = 'GET_VAULTS'
export const getVaults = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexer(
      VAULTS_QUERY,
      VAULTS_QUERY_NAME,
      VAULTS_QUERY_VARIABLE,
    )

    const { lending_controller = [] } = storage

    const vaults = lending_controller.length ? normalizeVaults(lending_controller[0]) : []

    dispatch({
      type: GET_VAULTS,
      vaults,
    })
  } catch (e) {
    console.error('getVaults error: ', e)
  }
}
