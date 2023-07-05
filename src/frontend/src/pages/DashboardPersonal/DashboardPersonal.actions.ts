import { OpKind, WalletParamsWithKind } from '@taquito/taquito'

import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { getVestingStorage } from 'pages/Treasury/Treasury.actions'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

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
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

// TODO: move to context action flow
export const claimAllRewardsAction =
  (tokens: TokensContext['tokensMetadata']) => async (dispatch: AppDispatch, getState: GetState) => {
    const {
      wallet: { accountPkh },
      contractAddresses: { doormanAddress },
    }: State = getState()

    if (!accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // update it to be from args after moving to context
      const availableDoormanRewards = 0,
        availableFarmRewards = {} as any,
        availableSatellitesRewards = 0
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      // if user has farm rewards to claim it will transfrom this rewards to batch call getting rewards array
      const farmsRewardsBatchPart = await Promise.all(
        Object.keys(availableFarmRewards)
          .reduce<Array<() => Promise<WalletParamsWithKind>>>((callbacks, farmAddress) => {
            if (availableFarmRewards[farmAddress].myAvailableFarmRewards > 0) {
              callbacks.push(async () => {
                const farmContractInstance = await tezos?.wallet.at(farmAddress)

                return {
                  kind: OpKind.TRANSACTION,
                  ...farmContractInstance.methods.claim(farmAddress).toTransferParams(),
                }
              })
            }

            return callbacks
          }, [])
          .map((fn) => fn()),
      )

      const bachArr = [...farmsRewardsBatchPart]

      // if user has satelite/doorman reward batch part of getting this reward will be added to the batch array
      if (availableDoormanRewards > 0 || availableSatellitesRewards > 0) {
        const doormanContractInstance = await tezos?.wallet.at(doormanAddress.address)
        bachArr.push({
          kind: OpKind.TRANSACTION,
          ...doormanContractInstance.methods.compound(accountPkh).toTransferParams(),
        })
      }
      const batch = tezos?.wallet.batch(bachArr)
      const transaction = await batch.send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Claiming rewards...', ACTION_START_MESSAGE_TEXT))

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
            await dispatch(getSatellitesStorage())
            await dispatch(getFarmStorage(tokens))

            // Add here call for update data actions
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Rewards claimed.', ACTION_COMPLETION_MESSAGE_TEXT))
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
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

// TODO: move to context action flow (already added, test it)
export const claimVestingReward = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: { accountPkh },
    contractAddresses: { vestingAddress },
  }: State = getState()

  if (!accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(vestingAddress.address)
    const transaction = await contract?.methods.claim().send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Claiming vesting reward...', ACTION_START_MESSAGE_TEXT))

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
          await dispatch(getVestingStorage())

          // Add here call for update data actions
          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Vesting reward claimed', ACTION_COMPLETION_MESSAGE_TEXT))
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
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}
