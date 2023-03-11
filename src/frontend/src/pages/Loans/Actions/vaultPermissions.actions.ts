import { OpKind } from '@taquito/taquito'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { LoanVaultAllowanceType } from 'utils/TypesAndInterfaces/Loans'
import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from '../Loans.const'
import { getLoansStorage } from './getLoansData.actions'

export const changeBakerAction =
  (bakerAddress: string, vaultAddress: string, callback: () => void) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(vaultAddress)
      const transaction = await contract?.methods.initVaultAction('delegateTezToBaker', bakerAddress).send()

      callback()
      dispatch(toggleActionLoader(true))
      dispatch(showToaster(INFO, 'Changing XTZ Baker...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(getLoansStorage())
      dispatch(showToaster(SUCCESS, 'Baker changed.', 'All good :)'))
      dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('changeBakerAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionLoader(false))
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

    if (state.loading.isActionLoading) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(vaultAddress)
      let transaction = null

      // if depostiorAllowance === VAULT_ALLOWANCE_ANY call updateDepositor with any 2 args and VAULT_ALLOWANCE_ANY config
      if (depostiorAllowance === VAULT_ALLOWANCE_ANY) {
        transaction = await contract?.methods.initVaultAction('updateDepositor', VAULT_ALLOWANCE_ANY, true).send()
      }

      // if newDepositorsAddresses is empty means we need to remove all depositors
      if (depostiorAllowance === VAULT_ALLOWANCE_ACCOUNTS && newDepositorsAddresses.length === 0) {
        const batch = state.wallet.tezos?.wallet.batch(
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
            // TODO: idk what's wrong with the enum typings here it sets kind to OpKind type instead of OpKind.TRANSACTION
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods
              .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, false, depositorAddress)
              .toTransferParams(),
          })),
          ...depositorsToAdd.map((depositorAddress) => ({
            // TODO: idk what's wrong with the enum typings here it sets kind to OpKind type instead of OpKind.TRANSACTION
            kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
            ...contract.methods
              .initVaultAction('updateDepositor', VAULT_ALLOWANCE_ACCOUNTS, true, depositorAddress)
              .toTransferParams(),
          })),
        ]

        const batch = state.wallet.tezos?.wallet.batch(batchArr)
        transaction = await batch?.send()
      }

      callback()
      dispatch(toggleActionLoader(true))
      dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(getLoansStorage())
      dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
      dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('borrowVaultAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      dispatch(toggleActionLoader(false))
    }
  }

export const updateOperatorsAction = (callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // prepare and send query
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
    // const transaction  = await contract?.methods.any.send()

    callback()
    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

    // confirm query completion
    // await transaction?.confirmation()

    // refetch data we need
    await dispatch(getLoansStorage())
    dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
    dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('borrowVaultAssetAction error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      callback()
    }
    dispatch(toggleActionLoader(false))
  }
}
