import { OpKind, TransactionWalletOperation } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  ERROR,
  INFO,
  SUCCESS,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
} from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { getLoansStorage } from './getLoansData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'

export const depositLendingAssetAction =
  (
    loanTokenName: string,
    addLiquidityAmount: number,
    tokenAddress: string,
    // TODO: make it dynamic, blocked by backend
    assetId: number,
    tokenType: TokenType,
    assetDecimals: number,
    callback: () => void,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const convertedAssetAmount = convertNumberForContractCall({ number: addLiquidityAmount, grade: assetDecimals })
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction: TransactionWalletOperation | BatchWalletOperation | null = null

      if (tokenType === 'tez') {
        transaction = await contract?.methods
          .addLiquidity(loanTokenName, convertedAssetAmount)
          .send({ amount: convertedAssetAmount, mutez: true })
      } else if (tokenType === 'fa12') {
        const assetContract = await tezos.wallet.at(tokenAddress)
        const batch = await tezos.wallet.batch([
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods.approve(state.contractAddresses.lendingController.address, 0).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .approve(state.contractAddresses.lendingController.address, convertedAssetAmount)
              .toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract?.methods.addLiquidity(convertedAssetAmount, loanTokenName).toTransferParams(),
          },
        ])
        transaction = await batch.send()
      } else {
        const assetContract = await tezos.wallet.at(tokenAddress)
        const batch = await tezos.wallet.batch([
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  add_operator: {
                    owner: state.wallet.accountPkh,
                    operator: state.contractAddresses.lendingController.address,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.addLiquidity(loanTokenName, convertedAssetAmount).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  remove_operator: {
                    owner: state.wallet.accountPkh,
                    operator: state.contractAddresses.lendingController.address,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
        ])
        transaction = await batch.send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(showToaster(TOASTER_INFO, 'Adding liquidity...', 'Please wait 30s'))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(showToaster(TOASTER_LOADING, 'Processing', 'Waiting for transaction confirmation... '))

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Liquidity added.', 'All good :)'))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('depositLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

export const withdrawLendingAssetAction =
  (loanTokenName: string, removeLiquidityAmount: number, assetDecimals: number, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: removeLiquidityAmount, grade: assetDecimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.removeLiquidity(loanTokenName, convertedAssetAmount).send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(showToaster(TOASTER_INFO, 'Removing liquidity...', 'Please wait 30s'))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(showToaster(TOASTER_LOADING, 'Processing', 'Waiting for transaction confirmation... '))

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Liquidity removed.', 'All good :)'))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('withdrawLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }
