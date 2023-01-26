import { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  LOANS_QUERY,
  LOANS_QUERY_NAME,
  LOANS_QUERY_VARIABLE,
  NEW_VAULT_QUERY,
  NEW_VAULT_QUERY_NAME,
  NEW_VAULT_QUERY_VARIABLE,
} from 'gql/queries/getLoansStorage'
import { normalizeLoans } from './Loans.helpers'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { State } from 'reducers'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { OpKind } from '@taquito/taquito'
import { getXTZBakers, getCollateralTokens, getLoansTokensRates } from './LoansFethcers'
import { updateTokensPrices } from 'reducers/actions/dipDupActions.actions'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens, mTokens, tokensPrices },
    wallet: {
      accountPkh,
      user: { mTokens: userMTokens },
    },
  } = getState()
  try {
    const storage = await fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE)

    const loanTokensRate = await getLoansTokensRates(
      storage?.lending_controller?.[0]?.loan_tokens,
      dipDupTokens,
      tokensPrices,
    )

    const xtzBakers = await getXTZBakers()

    const avaliableCollaterals = await getCollateralTokens(
      storage?.lending_controller?.[0].collateral_tokens,
      dipDupTokens,
      { ...tokensPrices, ...loanTokensRate },
      accountPkh,
    )

    const { chartsData, loanTokens, loansControllerAddress } = await normalizeLoans({
      storage: storage?.lending_controller?.[0],
      dipDupTokens,
      mTokens,
      userMTokens,
      userAddres: accountPkh,
      tokensRate: { ...tokensPrices, ...loanTokensRate },
    })

    await dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: {
        loansControllerAddress,
        chartsData,
        loanTokens,
        avaliableCollaterals,
        xtzBakers,
      },
    })
    await dispatch(updateTokensPrices(loanTokensRate))
  } catch (e) {
    console.error('getLoansStorage error: ', e)
  }
}

const getNewVaultData = async () => {
  try {
    const newVaultData = await fetchFromIndexer(NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE)

    return newVaultData.vault.at(-1)?.lending_controller_vaults[0].vault_id
  } catch (e) {
    console.log('getNewVaultData error: ', e)
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
      console.error('triggerInitialVaultCreation error:', error)
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
    callback: () => void,
    bakerAddress?: string,
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
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(newVaultAddress)

      let transaction = null

      if (collateralAssets.length === 1) {
        const { amount, assetAddress, assetId, collateralName, tokenType } = collateralAssets[0]

        if (tokenType === 'tez' && bakerAddress) {
          const batch = await state.wallet.tezos?.wallet.batch([
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.deposit(amount, 'tez').toTransferParams(),
              amount,
              mutez: true,
            },
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.delegateTezToBaker(bakerAddress).toTransferParams(),
            },
          ])

          transaction = await batch.send()
        }

        if (tokenType === 'fa12') {
          const assetContract = await state.wallet.tezos?.wallet.at(assetAddress)
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
              ...contract.methods.deposit(amount, collateralName).toTransferParams(),
            },
          ])

          transaction = await batch.send()
        }

        if (tokenType === 'fa2') {
          const assetContract = await state.wallet.tezos?.wallet.at(assetAddress)
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
              ...contract.methods.deposit(amount, collateralName).toTransferParams(),
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

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Creating Vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Vault Created.', 'All good :)'))

      // refetch data we need
      await dispatch(getLoansStorage())

      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('depositCollateralAction error:', error)
      callback()
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const depositLendingAssetAction =
  (loanTokenName: string, addLiquidityAmount: number, callback: () => void) =>
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
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.addLiquidity(loanTokenName, addLiquidityAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Adding Liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Liquidity Added.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('depositLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const withdrawLendingAssetAction =
  (loanTokenName: string, addLiquidityAmount: number, callback: () => void) =>
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
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.removeLiquidity(loanTokenName, addLiquidityAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Adding Liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Liquidity Added.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('withdrawLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const borrowVaultAssetAction =
  (vaultId: string, amountToBorrow: number, callback: () => void) =>
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
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.borrow(vaultId, amountToBorrow).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const withdrawCollateralAction = (callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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
    // const transaction  = await contract?.methods.any.send()

    callback()
    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

    // confirm query completion
    // await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
    // refetch data we need
    await dispatch(getLoansStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('borrowVaultAssetAction error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      callback()
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const repayPartOfVaultAction =
  (vaultId: string, repayAmount: number, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const transaction = await contract?.methods.repay(vaultId, repayAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const changeBakerAction =
  (bakerAddress: string, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
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

      const transaction = await contract?.methods.delegateTezToBaker(bakerAddress).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('changeBakerAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }
