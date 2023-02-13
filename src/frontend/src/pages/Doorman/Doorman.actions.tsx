import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import {
  DOORMAN_STORAGE_QUERY,
  DOORMAN_STORAGE_QUERY_NAME,
  DOORMAN_STORAGE_QUERY_VARIABLE,
  SMVK_HISTORY_DATA_QUERY,
  SMVK_HISTORY_DATA_QUERY_NAME,
  SMVK_HISTORY_DATA_QUERY_VARIABLE,
  MVK_MINT_HISTORY_DATA_QUERY,
  MVK_MINT_HISTORY_DATA_QUERY_NAME,
  MVK_MINT_HISTORY_DATA_QUERY_VARIABLE,
} from '../../gql/queries'
import { PRECISION_NUMBER } from '../../utils/constants'
import { HIDE_EXIT_FEE_MODAL } from './ExitFeeModal/ExitFeeModal.actions'
import { normalizeDoormanStorage, normalizeSmvkHistoryData, normalizeMvkMintHistoryData } from './Doorman.converter'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { updateUserData } from 'reducers/actions/user.actions'

export const GET_DOORMAN_STORAGE = 'GET_DOORMAN_STORAGE'
export const getDoormanStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const smvkStorage = await fetchFromIndexer(
      SMVK_HISTORY_DATA_QUERY,
      SMVK_HISTORY_DATA_QUERY_NAME,
      SMVK_HISTORY_DATA_QUERY_VARIABLE,
    )

    const smvkHistoryData = normalizeSmvkHistoryData(smvkStorage)

    const mvkStorage = await fetchFromIndexer(
      MVK_MINT_HISTORY_DATA_QUERY,
      MVK_MINT_HISTORY_DATA_QUERY_NAME,
      MVK_MINT_HISTORY_DATA_QUERY_VARIABLE,
    )

    const mvkMintHistoryData = normalizeMvkMintHistoryData(mvkStorage)

    const storage = await fetchFromIndexer(
      DOORMAN_STORAGE_QUERY,
      DOORMAN_STORAGE_QUERY_NAME,
      DOORMAN_STORAGE_QUERY_VARIABLE,
    )

    const { totalStakedMvk, totalSupply, maximumTotalSupply } = normalizeDoormanStorage(storage)

    dispatch({
      type: GET_DOORMAN_STORAGE,
      totalStakedMvk,
      totalSupply,
      maximumTotalSupply,
      mvkMintHistoryData,
      smvkHistoryData,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error('smvkHistoryData', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const stake = (amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const mvkTokenContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.mvkTokenAddress.address)
    const doormanContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.doormanAddress.address)

    const addOperators = [
        {
          add_operator: {
            owner: state.wallet.accountPkh,
            operator: state.contractAddresses.doormanAddress.address,
            token_id: 0,
          },
        },
      ],
      removeOperators = [
        {
          remove_operator: {
            owner: state.wallet.accountPkh,
            operator: state.contractAddresses.doormanAddress.address,
            token_id: 0,
          },
        },
      ]

    const batch =
      mvkTokenContract &&
      doormanContract &&
      (await state.wallet.tezos?.wallet
        .batch()
        .withContractCall(mvkTokenContract.methods.update_operators(addOperators))
        .withContractCall(doormanContract.methods.stake(amount * PRECISION_NUMBER))
        .withContractCall(mvkTokenContract.methods.update_operators(removeOperators)))
    const batchOp = await batch?.send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))

    await batchOp?.confirmation()

    dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))
    await dispatch(getDoormanStorage())
    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}

export const unstake = (amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.doormanAddress.address)
    const transaction = await contract?.methods.unstake(amount * PRECISION_NUMBER).send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))
    dispatch({
      type: HIDE_EXIT_FEE_MODAL,
    })

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))

    await dispatch(getDoormanStorage())
    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}

export const rewardsCompound = (address: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.doormanAddress.address)
    const transaction = await contract?.methods.compound(address).send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Compounding rewards...', 'Please wait 30s'))

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Compounding done', 'All good :)'))

    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}
