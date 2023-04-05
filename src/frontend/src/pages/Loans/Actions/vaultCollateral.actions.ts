import { OpKind, WalletParamsWithKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { getAvaliableCollaterals, getLoansStorage } from './getLoansData.actions'

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

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const convertedAssetAmount = convertNumberForContractCall({ number: withdrawAmount, grage: assetDecimals })
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      const transaction = await contract.methods
        .initVaultAction('withdraw', convertedAssetAmount, collateralAssetName)
        .send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Withdrawing collateral from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getAvaliableCollaterals())
      state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
      state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
      await dispatch(showToaster(SUCCESS, 'Collateral withdrawn.', 'All good :)'))
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
      decimals: number
      assetId: number
      tokenType: TokenType
    },
    callback: () => void,
    bakerAddress?: string | null,
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
      const { amount, assetAddress, assetId, collateralName, tokenType, decimals } = collateralAssets
      const convertedAssetAmount = convertNumberForContractCall({ number: amount, grage: decimals })

      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      let transaction = null

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
                    operator: state.contractAddresses.lendingController.address,
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
                    operator: state.contractAddresses.lendingController.address,
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

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Depositing collateral th the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getAvaliableCollaterals())
      state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
      state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
      await dispatch(showToaster(SUCCESS, 'Collateral added.', 'All good :)'))
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
