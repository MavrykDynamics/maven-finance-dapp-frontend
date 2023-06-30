import { Doorman, Farm, Satellite_Rewards } from 'utils/__generated__/graphql'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { PRECISION_NUMBER, FIXED_POINT_ACCURACY } from 'utils/constants'
import { UserFarmRewardsData } from '../user.provider.types'

// TODO: remove mutations in these 3 fns
export function calcUsersDoormanRewards({
  userDoormanRewardsFromGQL,
  mySMvkTokenBalance = 0,
}: {
  userDoormanRewardsFromGQL?: Doorman
  mySMvkTokenBalance: number
}): number {
  const myDoormanRewardsData = {
    generalAccumulatedFeesPerShare: userDoormanRewardsFromGQL?.accumulated_fees_per_share ?? 0,
    generalUnclaimedRewards: userDoormanRewardsFromGQL?.unclaimed_rewards ?? 0,
    myParticipationFeesPerShare: userDoormanRewardsFromGQL?.stake_accounts[0]?.participation_fees_per_share ?? 0,
    myAvailableDoormanRewards: 0,
  }
  const currentFeesPerShare =
    myDoormanRewardsData.generalAccumulatedFeesPerShare - myDoormanRewardsData.myParticipationFeesPerShare
  const usersAvailableDoormanRewards =
    (mySMvkTokenBalance * PRECISION_NUMBER * currentFeesPerShare) / FIXED_POINT_ACCURACY
  myDoormanRewardsData.myAvailableDoormanRewards = calcWithoutPrecision(
    String(Math.trunc(usersAvailableDoormanRewards)),
  )
  return myDoormanRewardsData.myAvailableDoormanRewards
}

export function calcUsersFarmRewards({
  currentBlockLevel,
  userFarmsRewardsFromGQL,
}: {
  currentBlockLevel: number
  userFarmsRewardsFromGQL: Array<Farm>
}): Record<string, UserFarmRewardsData> {
  const myFarmRewardsData: Record<string, UserFarmRewardsData> = userFarmsRewardsFromGQL.reduce<
    Record<string, UserFarmRewardsData>
  >((acc, farm) => {
    const farmObj: UserFarmRewardsData = {
      generalAccumulatedRewardsPerShare: farm.accumulated_rewards_per_share,
      currentRewardPerBlock: farm.current_reward_per_block,
      lastBlockUpdate: farm.last_block_update,
      generalTotalRewards: farm.total_rewards,
      generalPaidReward: farm.paid_rewards,
      generalUnpaidReward: farm.unpaid_rewards,
      totalLPTokenDeposited: farm.lp_token_balance,
      infinite: farm.infinite,
      myDepositedAmount: farm.farm_accounts[0].deposited_amount,
      myParticipationRewardsPerShare: farm.farm_accounts[0].participation_rewards_per_share,
      myAvailableFarmRewards: 0,
    }
    acc[farm.address] = farmObj

    return acc
  }, {})

  const newFarmRewardsData: Record<string, UserFarmRewardsData> = {}
  const farmsKeys = Object.keys(myFarmRewardsData)

  farmsKeys.forEach((farmKey) => {
    const farmAccount = myFarmRewardsData[farmKey]
    // Update farm general values
    const blockMultiplier = currentBlockLevel - farmAccount.lastBlockUpdate
    const suspectedRewards = blockMultiplier * farmAccount.currentRewardPerBlock
    const totalClaimedRewards = farmAccount.generalPaidReward + farmAccount.generalUnpaidReward
    const totalFarmRewards = suspectedRewards * totalClaimedRewards
    const totalPlannedRewards = farmAccount.generalTotalRewards
    const reward =
      totalFarmRewards > totalPlannedRewards && !farmAccount.infinite
        ? totalPlannedRewards - totalClaimedRewards
        : suspectedRewards
    const tempAccumulatedRewardsPerShare =
      farmAccount.generalAccumulatedRewardsPerShare +
      (reward * FIXED_POINT_ACCURACY) / farmAccount.totalLPTokenDeposited

    // Update user unclaimed rewards
    const currentRewardsPerShare = tempAccumulatedRewardsPerShare - farmAccount.myParticipationRewardsPerShare
    const usersAvailableFarmRewards = (currentRewardsPerShare * farmAccount.myDepositedAmount) / FIXED_POINT_ACCURACY

    farmAccount.myAvailableFarmRewards = calcWithoutPrecision(String(usersAvailableFarmRewards))
    newFarmRewardsData[farmKey] = farmAccount
  })

  return newFarmRewardsData
}

export function calcUsersSatelliteRewards({
  mySMvkTokenBalance = 0,
  userSatelliteRewardsFromGQL,
}: {
  mySMvkTokenBalance: number
  userSatelliteRewardsFromGQL?: Satellite_Rewards
}): number {
  const mySatelliteRewardsData = {
    unpaid: userSatelliteRewardsFromGQL?.unpaid ?? 0,
    paid: userSatelliteRewardsFromGQL?.paid ?? 0,
    participationRewardsPerShare: userSatelliteRewardsFromGQL?.participation_rewards_per_share ?? 0,
    satelliteAccumulatedRewardPerShare:
      userSatelliteRewardsFromGQL?.reference?.satellite_accumulated_reward_per_share ?? 0,
    myAvailableSatelliteRewards: 0,
  }

  const satelliteRewardRatio =
    mySatelliteRewardsData.satelliteAccumulatedRewardPerShare - mySatelliteRewardsData.participationRewardsPerShare
  const usersAvailableSatelliteRewards =
    (mySatelliteRewardsData.unpaid + satelliteRewardRatio * mySMvkTokenBalance * PRECISION_NUMBER) /
    FIXED_POINT_ACCURACY
  mySatelliteRewardsData.myAvailableSatelliteRewards = calcWithoutPrecision(
    String(Math.trunc(usersAvailableSatelliteRewards)),
  )
  return mySatelliteRewardsData.myAvailableSatelliteRewards
}
