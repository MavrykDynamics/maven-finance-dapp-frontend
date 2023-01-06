import { AppDispatch, coinGeckoClient, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'
import { getLoanTokensSymbols, normalizeLoans } from './Loans.helpers'
import { ModalTypes } from 'utils/TypesAndInterfaces/Loans'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens, mTokens },
    wallet: {
      user: { mTokens: userMTokens },
    },
  } = getState()
  try {
    const storage = await fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE)

    // fetching rate of the presented tokens insisde loans
    const loanTokensRate = (
      await Promise.allSettled(
        getLoanTokensSymbols({ storage, dipDupTokens }).map((symbol) => coinGeckoClient.coins.fetch(symbol, {})),
      )
    ).reduce<Record<string, number>>((acc, promiseResult) => {
      const {
        value: { data, success },
      } = promiseResult as any
      if (success) {
        const symbol = data.symbol
        const rate = data.market_data.current_price.usd
        acc[symbol] = rate
      }

      return acc
    }, {})

    const { chartsData, loanTokens, collateralTokens } = normalizeLoans({
      storage: storage?.lending_controller?.[0],
      dipDupTokens,
      mTokens,
      userMTokens,
      tokensRate: loanTokensRate,
    })

    await dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: {
        chartsData,
        loanTokens,
        collateralTokens,
      },
    })
  } catch (e) {
    console.error('getLoansStorage error: ', e)
  }
}

export const TOGGLE_LOANS_MODAL = 'TOGGLE_LOANS_MODAL'
export const toggleLoansModal = (modalToShow: ModalTypes) => async (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_LOANS_MODAL,
    payload: { currentModalActive: modalToShow },
  })
}
