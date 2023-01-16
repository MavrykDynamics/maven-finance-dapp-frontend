import { AppDispatch, coinGeckoClient, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'
import { getCollateralTokens, getLoanTokensSymbols, getUserBalances, normalizeLoans } from './Loans.helpers'
import { ModalTypes } from 'utils/TypesAndInterfaces/Loans'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { State } from 'reducers'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { OpKind } from '@taquito/taquito'

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

    const userAssetBalances = await getUserBalances({
      storage: storage?.lending_controller?.[0],
      accountPkh,
    })

    const avaliableCollaterals = await getCollateralTokens(
      storage?.lending_controller?.[0].collateral_tokens,
      storage?.lending_controller?.[0].loan_tokens,
      dipDupTokens,
      loanTokensRate,
      accountPkh,
    )

    const { chartsData, loanTokens, loansControllerAddress } = normalizeLoans({
      storage: storage?.lending_controller?.[0],
      dipDupTokens,
      mTokens,
      userMTokens,
      userAddres: accountPkh,
      tokensRate: loanTokensRate,
      userAssetBalances,
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

const getNewVaultData = async () => {
  try {
    const newVaultData = await fetchFromIndexer(
      `
    query GetNewVault {
      vault {
        lending_controller_vaults(order_by: {last_updated_timestamp: asc}, where: {lending_controller: {mock_time: {_eq: true}}}) {
          last_updated_timestamp
          vault_id
        }
      }
    }
    `,
      'GetNewVault',
      {},
    )

    return newVaultData.vault.at(-1)?.lending_controller_vaults[0].vault_id
  } catch (e) {
    console.log('e', e)
  }
}

// trigger initial vault creation to get the id of future vault
export const triggerInitialVaultCreation =
  (loanTokenName: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultFactory.address)
      const transaction = await contract?.methods
        .createVault(state.wallet.accountPkh, loanTokenName, 'whitelist', [])
        .send()

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      return await getNewVaultData()
    } catch (error) {
      console.error('submitProposal error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// deposit collateral to the vault
export const depositCollateralAction =
  (
    newVaultAddress: string,
    collateralAssets: Array<{
      collateralName: string
      assetAddress: string
      amount: number
      assetId: number
      tokenType: 'tez' | 'fa2' | 'fa12'
    }>,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      console.log('collateralAssets', collateralAssets)

      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(newVaultAddress)

      let transaction = null

      if (collateralAssets.length === 1) {
        const { amount, assetAddress, assetId, collateralName, tokenType } = collateralAssets[0]
        const assetContract = await state.wallet.tezos?.wallet.at(assetAddress)

        if (tokenType === 'tez') {
          const batch = await state.wallet.tezos?.wallet.batch([
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.deposit('tez', amount).toTransferParams(),
              amount,
              mutez: true,
            },
          ])

          transaction = await batch.send()
        }

        if (tokenType === 'fa12') {
          const batch = await state.wallet.tezos?.wallet.batch([
            {
              kind: OpKind.TRANSACTION,
              ...assetContract.methods.approve(newVaultAddress, 0).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...assetContract.methods.approve(newVaultAddress, amount).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.deposit(collateralName, amount).toTransferParams(),
            },
          ])

          transaction = await batch.send()
        }

        if (tokenType === 'fa2') {
          const fa2AddOperators = [
            {
              add_operator: {
                owner: state.wallet.accountPkh,
                operator: newVaultAddress,
                token_id: assetId, // Should be a number, usually 0
              },
            },
          ]

          const batch = await state.wallet.tezos?.wallet.batch([
            {
              kind: OpKind.TRANSACTION,
              ...assetContract.methods.update_operators(fa2AddOperators).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.deposit(collateralName, amount).toTransferParams(),
            },
          ])

          transaction = await batch.send()
        }
      } else {
        // TODO: handle case of adding multiple collaterals, for now disabled in view
        // const batch = await state.wallet.tezos?.wallet.batch(
        //   collateralAssets.map(({ collateralName, amount }) => {
        //     return {
        //       kind: OpKind.TRANSACTION,
        //       ...contract.methods.deposit(amount, collateralName).toTransferParams(),
        //     }
        //   }),
        // )
        // transaction = await batch.send()
      }

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Creating Vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

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

export const depositLendingAssetAction =
  (loanTokenName: string, addLiquidityAmount: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.addLiquidity(loanTokenName, addLiquidityAmount).send()

      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Adding Liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Liquidity Added.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('submitProposal error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }
