import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { getMTokensStorage } from 'reducers/actions/dipDupActions.actions'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { getLoansStorage } from './getLoansData.actions'
import { getFa12Batch, getFa2Batch } from './loansAction.helpers'

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

    if (state.loading.isActionLoading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const convertedAssetAmount = convertNumberForContractCall({ number: addLiquidityAmount, grage: assetDecimals })
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)

      let transaction = null

      if (tokenType === 'tez') {
        transaction = await contract?.methods
          .addLiquidity(loanTokenName, convertedAssetAmount)
          .send({ amount: convertedAssetAmount, mutez: true })
      }

      if (tokenType === 'fa12') {
        const assetContract = await state.wallet.tezos?.wallet.at(tokenAddress)
        const batchArr = getFa12Batch({
          assetName: loanTokenName,
          assetAmount: convertedAssetAmount,
          operatorAddress: state.contractAddresses.lendingController.address,
          assetContract,
          contractMethod: contract?.methods.addLiquidity,
        })

        const batch = await state.wallet.tezos?.wallet.batch(batchArr)
        transaction = await batch.send()
      }

      if (tokenType === 'fa2') {
        const assetContract = await state.wallet.tezos?.wallet.at(tokenAddress)
        const batchArr = getFa2Batch({
          assetName: loanTokenName,
          assetAmount: convertedAssetAmount,
          userAddress: state.wallet.accountPkh,
          operatorAddress: state.contractAddresses.lendingController.address,
          assetId: 0,
          assetContract,
          contractMethod: contract.methods.addLiquidity,
          isDepositCollateral: false,
        })

        const batch = await state.wallet.tezos?.wallet.batch(batchArr)
        transaction = await batch.send()
      }

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Adding liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getMTokensStorage())
      await dispatch(getLoansStorage())
      await dispatch(showToaster(SUCCESS, 'Liquidity added.', 'All good :)'))
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('depositLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
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

    if (state.loading.isActionLoading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      const convertedAssetAmount = convertNumberForContractCall({ number: removeLiquidityAmount, grage: assetDecimals })
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
      const transaction = await contract?.methods.removeLiquidity(loanTokenName, convertedAssetAmount).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Removing liquidity...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      // refetch data we need
      await dispatch(updateUserData())
      await dispatch(getMTokensStorage())
      await dispatch(getLoansStorage())
      await dispatch(showToaster(SUCCESS, 'Liquidity removed.', 'All good :)'))
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('withdrawLendingAssetAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }
