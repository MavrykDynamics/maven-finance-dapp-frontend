import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { State } from 'reducers'
import { LoanVaultAllowanceType } from 'utils/TypesAndInterfaces/Loans'
import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from '../Loans.const'
import { getLoansStorage } from './getLoansData.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

export const changeBakerAction =
  (bakerAddress: string, vaultAddress: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      const transaction = await contract?.methods.initVaultAction('setBaker', bakerAddress).send()

      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(showToaster(INFO, 'Changing XTZ Baker...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
          state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
        },
        currentOperationLevel,
      })

      dispatch(showToaster(SUCCESS, 'Baker changed.', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      console.error('changeBakerAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

export const managePermissionsAction =
  (
    vaultAddress: string,
    depostiorAllowance: LoanVaultAllowanceType,
    newDepositorsAddresses: Array<string>,
    vaultOriginalDepositros: Array<string>,
    callback: () => void,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActiveFullScreenLoader) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      // prepare and send query
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(vaultAddress)
      let transaction = null

      // if depostiorAllowance === VAULT_ALLOWANCE_ANY call updateDepositor with any 2 args and VAULT_ALLOWANCE_ANY config
      if (depostiorAllowance === VAULT_ALLOWANCE_ANY) {
        transaction = await contract?.methods.initVaultAction('updateDepositor', VAULT_ALLOWANCE_ANY, true).send()
      }

      // if newDepositorsAddresses is empty means we need to remove all depositors
      if (depostiorAllowance === VAULT_ALLOWANCE_ACCOUNTS && newDepositorsAddresses.length === 0) {
        const batch = tezos.wallet.batch(
          vaultOriginalDepositros.length === 0
            ? [
                {
                  kind: OpKind.TRANSACTION,
                  ...contract.methods
                    .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, state.wallet.accountPkh)
                    .toTransferParams(),
                },
              ]
            : vaultOriginalDepositros.map((depositorAddress) => ({
                kind: OpKind.TRANSACTION,
                ...contract.methods
                  .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, depositorAddress)
                  .toTransferParams(),
              })),
        )
        transaction = await batch?.send()
      }

      // if newDepositorsAddresses is not empty means we need to add new depositors or remove some of the old ones
      if (depostiorAllowance === VAULT_ALLOWANCE_ACCOUNTS && newDepositorsAddresses.length !== 0) {
        const depositorsToRemove = vaultOriginalDepositros.filter(
          (depositorAddress) => !newDepositorsAddresses.includes(depositorAddress),
        )
        const depositorsToAdd = newDepositorsAddresses.filter(
          (depositorAddress) => !vaultOriginalDepositros.includes(depositorAddress),
        )

        const batchArr = [
          ...depositorsToRemove.map((depositorAddress) => ({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods
              .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, depositorAddress)
              .toTransferParams(),
          })),
          ...depositorsToAdd.map((depositorAddress) => ({
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods
              .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, true, depositorAddress)
              .toTransferParams(),
          })),
        ]

        const batch = tezos.wallet.batch(batchArr)
        transaction = await batch?.send()
      }

      callback()
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(showToaster(INFO, 'Updating depositors...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
          state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
        },
        currentOperationLevel,
      })

      dispatch(showToaster(SUCCESS, 'Depositors updated.', 'All good :)'))
      dispatch(toggleActionFullScreenLoader(false))
    } catch (error) {
      console.error('managePermissionsAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionFullScreenLoader(false))
    }
  }

export const updateOperatorsAction = (callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // prepare and send query
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)
    // const transaction  = await contract?.methods.any.send()

    callback()
    dispatch(toggleActionFullScreenLoader(true))
    dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

    // confirm query completion
    // await transaction?.confirmation()

    // @ts-ignore don't have proper type to acees data, type has only methods
    const currentOperationLevel = transaction?.lastHead?.header?.level

    // refetch data we need
    await checkIndexerLevelAndRunDataUpdateCallback({
      callback: async () => {
        state.vaults.isLoaded && (await dispatch(getVaultsStorage()))
        state.loans.isDataLoaded && (await dispatch(getLoansStorage()))
      },
      currentOperationLevel,
    })

    dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
    dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    console.error('borrowVaultAssetAction error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      callback()
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}
