import { OpKind } from '@taquito/taquito'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { updateUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import { getLoansStorage } from './getLoansData.actions'
import { getFa12Batch, getFa2Batch } from './loansAction.helpers'

// remove collateral from the vault
export const withdrawCollateralAction =
  (withdrawAmount: number, collateralAssetName: string, vaultAddress: string, callback: () => void) =>
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
      const contract = await state.wallet.tezos?.wallet.at(vaultAddress)
      const transaction = await contract.methods.withdraw(withdrawAmount, collateralAssetName).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))

      // refetch data we need
      await dispatch(updateUserData())
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

// deposit new & existing collateral to the vault
export const depositCollateralAction =
  (
    vaultAddress: string,
    collateralAssets: {
      collateralName: string
      assetAddress: string
      amount: number
      assetId: number
      tokenType: 'tez' | 'fa2' | 'fa12'
    },
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
      const { amount, assetAddress, assetId, collateralName, tokenType } = collateralAssets

      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(vaultAddress)
      let transaction = null

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
        const batchArr = getFa12Batch({
          assetName: collateralName,
          assetAmount: amount,
          operatorAddress: vaultAddress,
          assetContract,
          contractMethod: contract.methods.deposit,
        })

        const batch = await state.wallet.tezos?.wallet.batch(batchArr)
        transaction = await batch.send()
      }

      if (tokenType === 'fa2') {
        const assetContract = await state.wallet.tezos?.wallet.at(assetAddress)
        const batchArr = getFa2Batch({
          assetName: collateralName,
          assetAmount: amount,
          userAddress: state.wallet.accountPkh,
          operatorAddress: vaultAddress,
          assetId: 0,
          assetContract,
          contractMethod: contract.methods.deposit,
        })

        const batch = await state.wallet.tezos?.wallet.batch(batchArr)
        transaction = await batch.send()
      }

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Creating Vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Vault Created.', 'All good :)'))

      // refetch data we need
      await dispatch(updateUserData())
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
