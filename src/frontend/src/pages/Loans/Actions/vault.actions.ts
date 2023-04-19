import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { getLoansStorage } from './getLoansData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { scrollUpPage } from 'utils/scrollUpPage'

// trigger initial vault creation to get the id of future vault
export const triggerInitialVaultCreation =
  (loanTokenName: string, vaultName: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.vaultFactory.address)
      const transaction = await contract?.methods.createVault(null, loanTokenName, vaultName, [], 'any').send()

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      const { value } = await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(updateUserData())
          state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
          state.loans.isDataLoaded && (await dispatch(getLoansStorage()))

          const newVaultData = await fetchFromIndexer(NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE)

          return newVaultData.vault.at(-1)?.lending_controller_vaults?.[0]?.vault_id
        },
        currentOperationLevel,
      })

      return value
    } catch (error) {
      console.error('triggerInitialVaultCreation error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
      return
    }
  }

// borrow asset from the vault
export const borrowVaultAssetAction =
  (
    vaultId: number,
    amountToBorrow: number,
    assetDecimals: number,
    callback: () => void,
    scrollToCurrentVault: () => void,
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
      const convertedAssetAmount = convertNumberForContractCall({ number: amountToBorrow, grade: assetDecimals })
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.borrow(vaultId, convertedAssetAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(updateUserData())
          state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
          state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
      await dispatch(toggleActionLoader(false))
      scrollToCurrentVault()
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// parlty repay vault
export const repayPartOfVaultAction =
  (
    vaultId: number,
    vaultAddress: string,
    repayAmount: number,
    assetDecimals: number,
    tokenType: TokenType,
    tokenAddress: string,
    callback: () => void,
    scrollToCurrentVault: () => void,
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
      const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: assetDecimals })
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction = null

      if (tokenType === 'fa12') {
        const assetContract = await tezos.wallet.at(tokenAddress)
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
            ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
          },
        ]

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else if (tokenType === 'fa2') {
        const assetContract = await tezos.wallet.at(tokenAddress)
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
            ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
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
      } else {
        transaction = await contract?.methods.repay(vaultId, convertedAssetAmount).send()
      }

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Repaying asset...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(updateUserData())
          state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
          state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Asset repayed.', 'All good :)'))
      await dispatch(toggleActionLoader(false))
      scrollToCurrentVault()
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// repay full vault and close it
export const repayFullAndCloseVaultAction =
  (
    vaultId: number,
    vaultAddress: string,
    repayAmount: number,
    assetDecimals: number,
    tokenType: TokenType,
    tokenAddress: string,
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
      const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grade: assetDecimals })
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
      let transaction = null

      if (tokenType === 'fa12') {
        const assetContract = await tezos.wallet.at(tokenAddress)
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
            ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
          },
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.closeVault(vaultId).toTransferParams(),
          },
        ]

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else if (tokenType === 'fa2') {
        const assetContract = await tezos.wallet.at(tokenAddress)
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
            ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
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
          {
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods.closeVault(vaultId).toTransferParams(),
          },
        ]

        const batch = await tezos.wallet.batch(batchArr)
        transaction = await batch.send()
      } else {
        transaction = await tezos.wallet
          .batch([
            {
              kind: OpKind.TRANSACTION,
              ...contract?.methods.repay(vaultId, convertedAssetAmount).toTransferParams(),
            },
            {
              kind: OpKind.TRANSACTION,
              ...contract.methods.closeVault(vaultId).toTransferParams(),
            },
          ])
          .send()
      }

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Repaying asset...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          await dispatch(updateUserData())
          state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
          state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
        },
        currentOperationLevel,
      })

      await dispatch(showToaster(SUCCESS, 'Asset repayed.', 'All good :)'))
      await dispatch(toggleActionLoader(false))

      // scroll up to top of page, after closing vault
      scrollUpPage()
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }
