import { AppDispatch, coinGeckoClient, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'
import { getLoanTokensSymbols, normalizeLoans } from './Loans.helpers'
import { ModalTypes } from 'utils/TypesAndInterfaces/Loans'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { State } from 'reducers'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens, mTokens },
    wallet: {
      accountPkh,
      user: { mTokens: userMTokens },
    },
  } = getState()
  try {
    const storage = await fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE)

    // fetching rate of the presented tokens insisde loans
    const loanTokensRate = await (
      await Promise.all(
        getLoanTokensSymbols({ loan_tokens: storage?.lending_controller?.[0]?.loan_tokens, dipDupTokens }).map(
          (symbol) => coinGeckoClient.coins.fetch(symbol, {}),
        ),
      )
    ).reduce<Record<string, number>>((acc, promiseResult) => {
      if (promiseResult?.success && promiseResult?.code === 200) {
        // TODO: extract this, and consider use id instead of symbol
        const symbol = promiseResult.data.symbol === 'xtz' ? 'tezos' : promiseResult.data.symbol
        const rate = promiseResult.data.market_data.current_price.usd
        acc[symbol] = rate
      }

      return acc
    }, {})

    const { chartsData, loanTokens, avaliableCollaterals, loansControllerAddress } = normalizeLoans({
      storage: storage?.lending_controller?.[0],
      dipDupTokens,
      mTokens,
      userMTokens,
      userAddres: accountPkh,
      tokensRate: loanTokensRate,
    })

    await dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: {
        loansControllerAddress,
        chartsData,
        loanTokens,
        avaliableCollaterals,
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

export const depositCollateralAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // prepare and send query

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

    // confirm query completion

    await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))
    // refetch data we need
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('submitProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const depositLendingAssetAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // prepare and send query

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Submitting proposal...', 'Please wait 30s'))

    // confirm query completion

    await dispatch(showToaster(SUCCESS, 'Proposal Submitted.', 'All good :)'))
    // refetch data we need
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('submitProposal error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
