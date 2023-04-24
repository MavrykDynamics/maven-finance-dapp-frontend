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
  MVK_HISTORY_DATA_QUERY,
  MVK_HISTORY_DATA_QUERY_NAME,
  MVK_HISTORY_DATA_QUERY_VARIABLE,
} from '../../gql/queries'
import { normalizeDoormanStorage, normalizeSmvkHistoryData, normalizeMvkHistoryData } from './Doorman.converter'
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { updateUserData } from 'reducers/actions/user.actions'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const GET_DOORMAN_STORAGE = 'GET_DOORMAN_STORAGE'
export const getDoormanStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    contractAddresses: {
      doormanAddress: { address },
    },
  } = getState()
  try {
    const smvkStorage = await fetchFromIndexer(
      SMVK_HISTORY_DATA_QUERY,
      SMVK_HISTORY_DATA_QUERY_NAME,
      SMVK_HISTORY_DATA_QUERY_VARIABLE,
    )

    const smvkHistoryData = normalizeSmvkHistoryData(smvkStorage)

    //TODO: @maksym, Cleanup and explore it being normalized at the same time in the
    // normalizeSmvkHistoryData(smvkStorage) call. Should be able to as its the same query.
    // there is no need to do a separate query for the mvkHistoryData given the updated smvk_history_data
    // schema in the indexer
    const mvkStorage = await fetchFromIndexer(
      MVK_HISTORY_DATA_QUERY,
      MVK_HISTORY_DATA_QUERY_NAME,
      MVK_HISTORY_DATA_QUERY_VARIABLE,
    )

    const mvkHistoryData = normalizeMvkHistoryData(smvkStorage)

    const storage = await fetchFromIndexer(
      DOORMAN_STORAGE_QUERY,
      DOORMAN_STORAGE_QUERY_NAME,
      DOORMAN_STORAGE_QUERY_VARIABLE(address),
    )

    const { totalStakedMvk, totalSupply, maximumTotalSupply } = normalizeDoormanStorage(storage)

    dispatch({
      type: GET_DOORMAN_STORAGE,
      totalStakedMvk,
      totalSupply,
      maximumTotalSupply,
      mvkHistoryData,
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

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const mvkTokenContract = await tezos?.wallet.at(state.contractAddresses.mvkTokenAddress.address)
    const doormanContract = await tezos?.wallet.at(state.contractAddresses.doormanAddress.address)

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
      (await tezos.wallet
        .batch()
        .withContractCall(mvkTokenContract.methods.update_operators(addOperators))
        .withContractCall(doormanContract.methods.stake(convertNumberForContractCall({ number: amount })))
        .withContractCall(mvkTokenContract.methods.update_operators(removeOperators)))
    const batchOp = await batch?.send()

    await dispatch(toggleActionFullScreenLoader(true))
    await dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))

    await batchOp?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))
    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
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

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.doormanAddress.address)
    const transaction = await contract?.methods.unstake(convertNumberForContractCall({ number: amount })).send()

    await dispatch(toggleActionFullScreenLoader(true))
    await dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))
    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}

export const rewardsCompound = (address: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(state.contractAddresses.doormanAddress.address)
    const transaction = await contract?.methods.compound(address).send()

    await dispatch(toggleActionFullScreenLoader(true))
    await dispatch(showToaster(INFO, 'Compounding rewards...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Compounding done', 'All good :)'))
    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}

export const getMVKTokensFromFaucet = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.tokens.mvkFaucetAddress) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'No faucet address provided'))
    return
  }

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }
  if (state.loading.isActionActive) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }
  if (state.wallet.user.myMvkTokenBalance > 0 || state.wallet.user.mySMvkTokenBalance > 0) {
    dispatch(
      showToaster(ERROR, 'You have already claimed MVK', 'You are unable to claim MVK, you have already claimed'),
    )
    return
  }
  try {
    await dispatch(toggleActionFullScreenLoader(true))
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at('KT1A6EJRMuz8TZWeSxaqvU2UsqxRjopvo8Nh')
    const operation = await contract.methods.requestMvk().send()

    dispatch(showToaster(INFO, 'Requesting MVK...', 'Please wait 15s'))

    await operation?.confirmation()

    dispatch(showToaster(SUCCESS, 'Received 1,000 MVK...', 'Enjoy using Mavryk Finance :)'))
    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleActionFullScreenLoader(false))
    }
  }
}
