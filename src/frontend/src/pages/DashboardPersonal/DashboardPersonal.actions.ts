import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { State } from 'reducers'
import { updateUserData } from 'reducers/actions/user.actions'
import { OpKind, WalletParamsWithKind } from '@taquito/taquito'

export const claimAllRewardsAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: {
      tezos,
      accountPkh,
      user: { myFarmRewardsData, myDoormanRewardsData, mySatelliteRewardsData },
    },
    contractAddresses: { doormanAddress },
    loading: { isActionLoading },
  }: State = getState()

  if (!accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // if user has farm rewards to claim it will transfrom this rewards to batch call getting rewards array
    const farmsRewardsBatchPart = await Object.keys(myFarmRewardsData).reduce<Promise<Array<WalletParamsWithKind>>>(
      async (promsieAcc, farmAddress) => {
        const acc = await promsieAcc

        if (myFarmRewardsData[farmAddress].myAvailableFarmRewards > 0) {
          const farmContractInstance = await tezos?.wallet.at(farmAddress)

          acc.push({
            kind: OpKind.TRANSACTION,
            ...farmContractInstance.methods.claim(farmAddress).toTransferParams(),
          })
        }

        return acc
      },
      Promise.resolve([]),
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

    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Submitting emergency proposal...', 'Please wait 30s'))

    await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Emergency Proposal Submitted', 'All good :)'))
    await dispatch(getDelegationStorage())
    await dispatch(updateUserData())
    await dispatch(getDoormanStorage())
    await dispatch(getFarmStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      await dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleActionLoader(false))
  }
}
