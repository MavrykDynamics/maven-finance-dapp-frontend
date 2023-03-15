import { OpKind } from '@taquito/taquito'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { getAvaliableCollaterals, getLoansStorage, getLoansVaultsData } from './getLoansData.actions'

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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultFactory.address)
      const transaction = await contract?.methods.createVault(undefined, loanTokenName, vaultName, 'any').send()

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getLoansStorage())
      const newVaultData = await fetchFromIndexer(NEW_VAULT_QUERY, NEW_VAULT_QUERY_NAME, NEW_VAULT_QUERY_VARIABLE)
      return newVaultData.vault.at(-1)?.lending_controller_vaults[0].vault_id
    } catch (error) {
      console.error('triggerInitialVaultCreation error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleActionLoader(false))
    }
  }

// borrow asset from the vault
export const borrowVaultAssetAction =
  (vaultId: number, amountToBorrow: number, assetDecimals: number, callback: () => void) =>
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
      const convertedAssetAmount = convertNumberForContractCall({ number: amountToBorrow, grage: assetDecimals })
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.borrow(vaultId, convertedAssetAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getAvaliableCollaterals())
      await dispatch(getLoansVaultsData())
      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
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

// parlty repay vault
export const repayPartOfVaultAction =
  (vaultId: number, repayAmount: number, assetDecimals: number, callback: () => void) =>
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
      const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grage: assetDecimals })
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.repay(vaultId, convertedAssetAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Repaying asset...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getAvaliableCollaterals())
      await dispatch(getLoansVaultsData())
      await dispatch(showToaster(SUCCESS, 'Asset repayed.', 'All good :)'))
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

// repay full vault and close it
export const repayFullAndCloseVaultAction =
  (vaultId: number, repayAmount: number, assetDecimals: number, callback: () => void) =>
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
      const convertedAssetAmount = convertNumberForContractCall({ number: repayAmount, grage: assetDecimals })
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const batch = await state.wallet.tezos?.wallet
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

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Repaying asset...', 'Please wait 30s'))

      // confirm query completion
      await batch?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getAvaliableCollaterals())
      await dispatch(getLoansVaultsData())
      await dispatch(showToaster(SUCCESS, 'Asset repayed.', 'All good :)'))
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
