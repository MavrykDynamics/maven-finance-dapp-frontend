import { OpKind, WalletParamsWithKind } from '@taquito/taquito'
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
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { getAvaliableCollaterals, getLoansStorage } from './getLoansData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation'

// remove collateral from the vault
export const withdrawCollateralAction =
  (
    withdrawAmount: number,
    collateralAssetName: string,
    vaultAddress: string,
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
      const convertedAssetAmount = convertNumberForContractCall({ number: withdrawAmount, grade: assetDecimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      const transaction = await contract.methods
        .initVaultAction('withdraw', convertedAssetAmount, collateralAssetName)
        .send()

      // close popup
      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(showToaster(TOASTER_INFO, 'Withdrawing collateral from the vault...', 'Please wait 30s'))

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
            await dispatch(getAvaliableCollaterals())
            state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
            state.loans.isDataLoaded && (await dispatch(getLoansStorage()))

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Collateral withdrawn.', 'All good :)'))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('withdrawCollateralAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionFullScreenLoader(false))
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
      decimals: number
      assetId: number
      tokenType: TokenType
    },
    callback: () => void,
    bakerAddress?: string | null,
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
      const { amount, assetAddress, assetId, collateralName, tokenType, decimals } = collateralAssets
      const convertedAssetAmount = convertNumberForContractCall({ number: amount, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      let transaction: BatchWalletOperation | null = null

      if (tokenType === 'tez') {
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
      }

      if (tokenType === 'fa12') {
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
      }

      if (tokenType === 'fa2') {
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
      dispatch(showToaster(TOASTER_INFO, 'Depositing collateral th the vault...', 'Please wait 30s'))

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
            await dispatch(getAvaliableCollaterals())
            state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
            state.loans.isDataLoaded && (await dispatch(getLoansStorage()))

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Collateral added.', 'All good :)'))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('depositCollateralAction error:', error)
      callback()
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionFullScreenLoader(false))
    }
  }
