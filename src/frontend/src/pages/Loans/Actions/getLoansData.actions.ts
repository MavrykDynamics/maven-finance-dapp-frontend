import { AppDispatch, GetState } from 'app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  AVALIABLE_COLLATERALS_QUERY,
  AVALIABLE_COLLATERALS_QUERY_NAME,
  AVALIABLE_COLLATERALS_QUERY_VARIABLE,
  LOANS_QUERY,
  LOANS_QUERY_NAME,
  LOANS_QUERY_VARIABLE,
  NEW_VAULT_QUERY,
  NEW_VAULT_QUERY_NAME,
  NEW_VAULT_QUERY_VARIABLE,
} from 'gql/queries/getLoansStorage'
import { normalizeLoans } from '../Loans.helpers'
import { getXTZBakers, getCollateralTokens } from '../LoansFethcers'
import { State } from 'reducers'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const CLEAR_LOANS_STORAGE = 'CLEAR_LOANS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens, mTokens },
    wallet: {
      accountPkh,
      user: { mTokens: userMTokens },
    },
    dataFeeds: { feedsLedger },
  } = getState()
  try {
    const storage = await fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE)

    const xtzBakers = await getXTZBakers()

    const { chartsData, loanTokens, loansControllerAddress, config } = await normalizeLoans({
      storage: storage?.lending_controller?.[0],
      dipDupData: dipDupTokens,
      mTokens,
      userMTokens,
      userAddres: accountPkh,
      feeds: feedsLedger,
    })

    await dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: {
        loansControllerAddress,
        chartsData,
        loanTokens,
        xtzBakers,
        config,
      },
    })
  } catch (e) {
    console.error('getLoansStorage error: ', e)
  }
}

export const getNewVaultData = async () => {
  try {
    const newVaultData = await fetchFromIndexer(NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE)

    return newVaultData.vault.at(-1)?.lending_controller_vaults[0].vault_id
  } catch (e) {
    console.log('getNewVaultData error: ', e)
  }
}

export const GET_AVALIABLE_COLLATERALS = 'GET_AVALIABLE_COLLATERALS'
export const getAvaliableCollaterals = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens },
    wallet: { accountPkh },
    dataFeeds: { feedsLedger },
  } = getState()
  try {
    const storage = await fetchFromIndexer(
      AVALIABLE_COLLATERALS_QUERY,
      AVALIABLE_COLLATERALS_QUERY_NAME,
      AVALIABLE_COLLATERALS_QUERY_VARIABLE,
    )

    const avaliableCollaterals = await getCollateralTokens(
      storage?.lending_controller?.[0]?.collateral_tokens,
      dipDupTokens,
      feedsLedger,
      accountPkh,
    )

    await dispatch({
      type: GET_AVALIABLE_COLLATERALS,
      avaliableCollaterals,
    })
  } catch (e) {
    console.log('getNewVaultData error: ', e)
  }
}

// update Loans or Vaults data according to the transaction call location
// use in popups in the BorrowingExpandCard component
export const getLoansVaultsData = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  const {
    loans: { isDataLoaded: isLoansStorageLoaded },
    vaults: { isLoaded: isVaultsStorageLoaded },
  } = state

  const isLoansPage = /loans/.test(window.location.pathname)
  const isVaultsPage = /vaults/.test(window.location.pathname)

  console.log({
    isLoansPage,
    isVaultsPage,
    isLoansStorageLoaded,
    isVaultsStorageLoaded,
  })

  if (isLoansPage || isLoansStorageLoaded) {
    console.log('loans')

    await dispatch(getLoansStorage())
  }

  if (isVaultsPage || isVaultsStorageLoaded) {
    console.log('vaults')

    await dispatch(getVaultsStorage())
  }
}
