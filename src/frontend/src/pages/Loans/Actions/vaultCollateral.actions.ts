import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'
import { OpKind, TransactionWalletOperation, WalletParamsWithKind } from '@taquito/taquito'

import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getAvaliableCollaterals, getLoansStorage } from './getLoansData.actions'
import { updateUserData } from 'reducers/actions/user.actions'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'

import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { TokenType } from 'utils/TypesAndInterfaces/General'

import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// remove collateral from the vault
export const withdrawCollateralAction =
  (
    withdrawAmount: number,
    collateralAssetName: string,
    vaultAddress: string,
    vaultId: number,
    assetDecimals: number,
    isStakedToken: boolean,
    callback: () => void,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()
    const {
      contractAddresses: { lendingController },
    } = state

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: withdrawAmount, grade: assetDecimals })
      const tezos = await DAPP_INSTANCE.tezos()
      let transaction: TransactionWalletOperation | null = null

      if (isStakedToken) {
        const contract = await tezos.wallet.at(lendingController.address)
        transaction = await contract.methods
          .vaultWithdrawStakedToken(collateralAssetName, vaultId, convertedAssetAmount)
          .send()
      } else {
        const contract = await tezos.wallet.at(vaultAddress)
        transaction = await contract.methods
          .initVaultAction('withdraw', convertedAssetAmount, collateralAssetName)
          .send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Withdrawing collateral from the vault...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())
            await dispatch(getAvaliableCollaterals())
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Collateral withdrawn.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('withdrawCollateralAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// deposit new & existing collateral to the vault
export const depositCollateralAction =
  (
    vaultAddress: string,
    vaultId: number,
    collateralAssets: {
      collateralName: string
      assetAddress: string
      amount: number
      decimals: number
      assetId: number
      tokenType: TokenType
      isStakedToken: boolean
    },
    callback: () => void,
    bakerAddress?: string | null,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()
    const {
      contractAddresses: { lendingController },
    } = state

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const { amount, assetAddress, assetId, collateralName, tokenType, decimals, isStakedToken } = collateralAssets
      const convertedAssetAmount = convertNumberForContractCall({ number: amount, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      let transaction: BatchWalletOperation | TransactionWalletOperation | null = null

      if (isStakedToken) {
        const contract = await tezos.wallet.at(lendingController.address)
        transaction = await contract.methods
          .vaultDepositStakedToken(collateralName, vaultId, convertedAssetAmount)
          .send()
      } else if (tokenType === 'tez') {
        const delegateToBakerBatchPart: Array<WalletParamsWithKind> = bakerAddress
          ? [
              {
                kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
                ...contract.methods.initVaultAction('setBaker', bakerAddress).toTransferParams(),
              },
            ]
          : []
        const batch = tezos.wallet.batch([
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.initVaultAction('deposit', convertedAssetAmount, 'tez').toTransferParams(),
            amount: convertedAssetAmount,
            mutez: true,
          },
          ...delegateToBakerBatchPart,
        ])

        transaction = await batch.send()
      } else if (tokenType === 'fa12') {
        const assetContract = await tezos.wallet.at(assetAddress)
        const batchArr = [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods.approve(vaultAddress, 0).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods.approve(vaultAddress, convertedAssetAmount).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.initVaultAction('deposit', convertedAssetAmount, collateralName).toTransferParams(),
          },
        ]

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else if (tokenType === 'fa2') {
        const assetContract = await tezos.wallet.at(assetAddress)

        const batchArr = [
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  add_operator: {
                    owner: state.wallet.accountPkh,
                    operator: vaultAddress,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.initVaultAction('deposit', convertedAssetAmount, collateralName).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...assetContract.methods
              .update_operators([
                {
                  remove_operator: {
                    owner: state.wallet.accountPkh,
                    operator: vaultAddress,
                    token_id: 0, // Should be a number, usually 0
                  },
                },
              ])
              .toTransferParams(),
          },
        ]

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      }

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Depositing collateral in the vault...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())
            await dispatch(getAvaliableCollaterals())
            await dispatch(getLoansStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Collateral added.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('depositCollateralAction error:', error)
      callback()
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }
