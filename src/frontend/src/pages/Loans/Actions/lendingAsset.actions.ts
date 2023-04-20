import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { getMTokensStorage } from 'reducers/actions/dipDupActions.actions'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { getLoansStorage } from './getLoansData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

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

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const convertedAssetAmount = convertNumberForContractCall({ number: addLiquidityAmount, grade: assetDecimals })
      // prepare and send query
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction = null

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

      callback()
      await dispatch(toggleActionFullScreenLoader(true))
      await dispatch(showToaster(INFO, 'Adding liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(updateUserData())
          await dispatch(getLoansStorage())
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Liquidity added.', 'All good :)'))
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      console.error('depositLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }

export const withdrawLendingAssetAction =
  (loanTokenName: string, removeLiquidityAmount: number, assetDecimals: number, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const convertedAssetAmount = convertNumberForContractCall({ number: removeLiquidityAmount, grade: assetDecimals })
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.removeLiquidity(loanTokenName, convertedAssetAmount).send()

      callback()
      await dispatch(toggleActionFullScreenLoader(true))
      await dispatch(showToaster(INFO, 'Removing liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(updateUserData())
          await dispatch(getLoansStorage())
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Liquidity removed.', 'All good :)'))
      await dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      console.error('withdrawLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }
