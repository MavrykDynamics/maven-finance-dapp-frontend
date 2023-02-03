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
import { updateTokensPrices } from 'reducers/actions/dipDupActions.actions'
import { normalizeLoans } from '../Loans.helpers'
import { getLoansTokensRates, getXTZBakers, getCollateralTokens } from '../LoansFethcers'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const CLEAR_LOANS_STORAGE = 'CLEAR_LOANS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens, mTokens, tokensPrices },
    wallet: {
      accountPkh,
      user: { mTokens: userMTokens },
    },
    oracles: {
      oraclesStorage: { feeds },
    },
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
      feeds,
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
    oracles: {
      oraclesStorage: { feeds },
    },
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
      feeds,
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
