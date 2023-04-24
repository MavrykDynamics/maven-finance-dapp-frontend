// types
import { State } from '../../reducers'
import { FarmContractType } from '../../utils/TypesAndInterfaces/Farm'
import type { AppDispatch, GetState } from '../../app/App.controller'

// queries
import { FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE } from '../../gql/queries'

// consts
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from '../../app/App.components/Toaster/Toaster.constants'

//helpers
import { getEndsInTimestampForFarmCards, getLPTokensInfo, normalizeFarmStorage } from './Farms.helpers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

// actions
import { getDoormanStorage } from '../Doorman/Doorman.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { updateUserData } from 'reducers/actions/user.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const GET_FARM_STORAGE = 'GET_FARM_STORAGE'
export const getFarmStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens },
  } = getState()
  // main try/catch to fetch endTime for farmsCards and farms cards from gql, if nested willl end up with error, it will set fetched card, of if this fail, will set []
  try {
    const storage = await fetchFromIndexer(FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE)
    const farmCardEndsIn = await getEndsInTimestampForFarmCards(storage?.farm)

    // try/catch to fetch lp coins metadata, if fails will log error and dispatch just farms cards with endTime
    try {
      const farmLPTokensInfo = await getLPTokensInfo(storage?.farm)

      // try/catch to fetch farms contracts, if fails it will log error and dispatch farms cards without contacts data
      try {
        const urls = farmLPTokensInfo.reduce<string[]>(
          (acc, item: { lpTokenInfo: { liquidityPairToken: { tokenAddress: string[] } } }) => {
            if (item?.lpTokenInfo?.liquidityPairToken?.tokenAddress?.[0]) {
              acc.push(`https://api.tzkt.io/v1/contracts/${item?.lpTokenInfo.liquidityPairToken.tokenAddress[0]}`)
            }
            return acc
          },
          [],
        )

        const farmContracts: FarmContractType[] = await Promise.all(
          urls.map(async (url) => await (await fetch(url)).json()),
        )

        const farms = normalizeFarmStorage(storage?.farm, dipDupTokens, farmCardEndsIn, farmLPTokensInfo, farmContracts)
        dispatch({
          type: GET_FARM_STORAGE,
          farms,
        })
      } catch (e) {
        console.error('getFarmStorage, fetching contracts error: ', e)

        const farms = normalizeFarmStorage(storage?.farm, dipDupTokens, farmCardEndsIn, farmLPTokensInfo, [])
        dispatch({
          type: GET_FARM_STORAGE,
          farms,
        })
      }
    } catch (e) {
      console.error('getFarmStorage, fetching metadata error: ', e)

      const farms = normalizeFarmStorage(storage?.farm, dipDupTokens, [], [], [])
      dispatch({
        type: GET_FARM_STORAGE,
        farms,
      })
    }
  } catch (e) {
    dispatch(showToaster(TOASTER_ERROR, 'Error while fetching farms data', 'Please try to reload page'))
  }
}

export const harvest = (farmAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const transaction = await contract?.methods.claim(farmAddress).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Harvesting...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getFarmStorage())
          await dispatch(getDoormanStorage())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Harvesting done', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

export const deposit = (farmAddress: string, amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(TOASTER_ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const transaction = await contract?.methods.deposit(convertNumberForContractCall({ number: amount })).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Depositing...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getFarmStorage())
          await dispatch(getDoormanStorage())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Depositing done', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

export const withdraw = (farmAddress: string, amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(TOASTER_ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const transaction = await contract?.methods.withdraw(convertNumberForContractCall({ number: amount })).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Withdrawing...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getFarmStorage())
          await dispatch(getDoormanStorage())

          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Withdrawing done', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }
    dispatch(toggleActionFullScreenLoader(false))
  }
}
