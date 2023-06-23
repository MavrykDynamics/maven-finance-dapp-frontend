import { OpKind, WalletParamsWithKind } from '@taquito/taquito'

import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getLoansStorage } from './getLoansData.actions'
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

import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { DepositCollateralType } from 'providers/LoansProvider/helpers/vaults.types'

// remove collateral from the vault
export const withdrawCollateralAction =
  (
    withdrawAmount: number,
    collateralToken: LoansCollateralTokenMetadataType,
    vaultAddress: string,
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
      const {
        decimals,
        loanData: { indexerName },
      } = collateralToken
      // prepare and send transaction
      const convertedAssetAmount = convertNumberForContractCall({ number: withdrawAmount, grade: decimals })
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      const transaction = await contract.methods.initVaultAction('withdraw', convertedAssetAmount, indexerName).send()

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

// deposit collaterals to the vault
export const depositCollateralsAction =
  (
    vaultAddress: string,
    collateralTokens: Array<DepositCollateralType>,
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
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)

      const operationKind = OpKind.TRANSACTION as OpKind.TRANSACTION

      const batchArr = await collateralTokens.reduce<Promise<Array<WalletParamsWithKind>>>(
        async (promiseAcc, { collateralName, amount, id, address, type }) => {
          const acc = await promiseAcc

          if (type === 'tez') {
            acc.push({
              kind: operationKind,
              ...contract.methods.initVaultAction('deposit', amount, 'tez').toTransferParams(),
              amount,
              mutez: true,
            })

            if (bakerAddress) {
              acc.push({
                kind: operationKind,
                ...contract.methods.initVaultAction('setBaker', bakerAddress).toTransferParams(),
              })
            }
          }

          if (type === 'fa12') {
            const assetContract = await tezos.wallet.at(address)

            acc.push({
              kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
              ...assetContract.methods.approve(vaultAddress, 0).toTransferParams(),
            })
            acc.push({
              kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
              ...assetContract.methods.approve(vaultAddress, amount).toTransferParams(),
            })
            acc.push({
              kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
              ...contract.methods.initVaultAction('deposit', amount, collateralName).toTransferParams(),
            })
          }

          if (type === 'fa2') {
            const assetContract = await tezos.wallet.at(address)

            acc.push({
              kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
              ...assetContract.methods
                .update_operators([
                  {
                    add_operator: {
                      owner: state.wallet.accountPkh,
                      operator: vaultAddress,
                      token_id: id,
                    },
                  },
                ])
                .toTransferParams(),
            })
            acc.push({
              kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
              ...contract.methods.initVaultAction('deposit', amount, collateralName).toTransferParams(),
            })
            acc.push({
              kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
              ...assetContract.methods
                .update_operators([
                  {
                    remove_operator: {
                      owner: state.wallet.accountPkh,
                      operator: vaultAddress,
                      token_id: id,
                    },
                  },
                ])
                .toTransferParams(),
            })
          }

          return acc
        },
        Promise.resolve([]),
      )

      const batch = await tezos.wallet.batch(batchArr)
      await batch.send()

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
