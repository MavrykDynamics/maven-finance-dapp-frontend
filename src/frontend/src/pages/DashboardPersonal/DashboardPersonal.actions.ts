import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { OpKind, WalletParamsWithKind } from '@taquito/taquito'
import { getVestingStorage } from 'pages/Treasury/Treasury.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const claimAllRewardsAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: {
      accountPkh,
      user: { myFarmRewardsData, myDoormanRewardsData, mySatelliteRewardsData },
    },
    contractAddresses: { doormanAddress },
    loading: { isActiveFullScreenLoader },
  }: State = getState()

  if (!accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    // if user has farm rewards to claim it will transfrom this rewards to batch call getting rewards array
    const farmsRewardsBatchPart = await Promise.all(
      Object.keys(myFarmRewardsData)
        .reduce<Array<() => Promise<WalletParamsWithKind>>>((callbacks, farmAddress) => {
          if (myFarmRewardsData[farmAddress].myAvailableFarmRewards > 0) {
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
    if (myDoormanRewardsData.myAvailableDoormanRewards > 0 || mySatelliteRewardsData.myAvailableSatelliteRewards > 0) {
      const doormanContractInstance = await tezos?.wallet.at(doormanAddress.address)
      bachArr.push({
        kind: OpKind.TRANSACTION,
        ...doormanContractInstance.methods.compound(accountPkh).toTransferParams(),
      })
    }
    const batch = tezos?.wallet.batch(bachArr)
    const transaction = await batch.send()

    await dispatch(toggleActionFullScreenLoader(true))
    await dispatch(showToaster(INFO, 'Submitting emergency proposal...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Emergency Proposal Submitted', 'All good :)'))
    await dispatch(getSatellitesStorage())
    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(getFarmStorage())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}

export const claimVestingReward = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: { accountPkh },
    loading: { isActiveFullScreenLoader },
    contractAddresses: { vestingAddress },
  }: State = getState()

  if (!accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(vestingAddress.address)
    const transaction = await contract?.methods.claim().send()

    await dispatch(toggleActionFullScreenLoader(true))
    await dispatch(showToaster(INFO, 'Claiming vesting reward...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Vesting reward claimed', 'All good :)'))
    await dispatch(updateUserData())
    await dispatch(getVestingStorage())
    await dispatch(toggleActionFullScreenLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionFullScreenLoader(false))
  }
}
