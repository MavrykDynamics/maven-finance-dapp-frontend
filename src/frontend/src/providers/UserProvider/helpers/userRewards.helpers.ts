import { GetUserDataSubscription } from 'utils/__generated__/graphql'
import { convertNumberForClient } from 'utils/calcFunctions'
import { FIXED_POINT_ACCURACY, MVK_DECIMALS } from 'utils/constants'

export function getUserDoomanRewards({
  userSmvkBalance,
  userDoormanRewardsDataFromIndexer,
}: {
  userSmvkBalance: number
  userDoormanRewardsDataFromIndexer: GetUserDataSubscription['mavryk_user'][number]['doorman_stake_accounts'][number]
}): number {
  const {
    participation_fees_per_share,
    doorman: { accumulated_fees_per_share, unclaimed_rewards },
  } = userDoormanRewardsDataFromIndexer

  const currentFeesPerShare = accumulated_fees_per_share - participation_fees_per_share
  const usersRewardsForStaking = (userSmvkBalance * currentFeesPerShare) / FIXED_POINT_ACCURACY

  return convertNumberForClient({ number: Math.trunc(usersRewardsForStaking + unclaimed_rewards), grade: MVK_DECIMALS })
}

export function getUserSatelliteRewards({
  userSmvkBalance,
  userSatelliteRewardsDataFromIndexer,
}: {
  userSmvkBalance: number
  userSatelliteRewardsDataFromIndexer: GetUserDataSubscription['mavryk_user'][number]['satellite_rewardss'][number]
}): number {
  const { unpaid, participation_rewards_per_share, reference } = userSatelliteRewardsDataFromIndexer
  const { satellite_accumulated_reward_per_share } = reference ?? { satellite_accumulated_reward_per_share: 0 }

  const satelliteRewardRatio = satellite_accumulated_reward_per_share - participation_rewards_per_share
  const usersAvailableSatelliteRewards = (unpaid + satelliteRewardRatio * userSmvkBalance) / FIXED_POINT_ACCURACY

  return convertNumberForClient({ number: Math.trunc(usersAvailableSatelliteRewards), grade: MVK_DECIMALS })
}

export function getUsersFarmRewards({
  currentLvl,
  userFarmsRewardsDataFromIndexer,
}: {
  currentLvl: number
  userFarmsRewardsDataFromIndexer: GetUserDataSubscription['mavryk_user'][number]['farm_accounts']
}) {
  return userFarmsRewardsDataFromIndexer.reduce<Record<string, number>>((acc, farmAccount) => {
    const {
      deposited_amount,
      participation_rewards_per_share,
      farm: {
        address: farmAddress,
        accumulated_rewards_per_share,
        lp_token_balance,
        total_rewards: farmMaxRewards,
        unpaid_rewards,
        paid_rewards,
        last_block_update,
        current_reward_per_block,
        infinite,
      },
    } = farmAccount

    const suspectedRewardsByHolding = (currentLvl - last_block_update) * current_reward_per_block
    const paidAndUnpaidRewards = unpaid_rewards + paid_rewards
    const farmTotalEarnedRewards = suspectedRewardsByHolding * paidAndUnpaidRewards

    const reward =
      farmTotalEarnedRewards > farmMaxRewards && !infinite
        ? farmMaxRewards - farmTotalEarnedRewards
        : suspectedRewardsByHolding

    const currentRewardsPerShareRatio =
      accumulated_rewards_per_share +
      (reward * FIXED_POINT_ACCURACY) / lp_token_balance -
      participation_rewards_per_share

    const userReward = convertNumberForClient({
      number: (currentRewardsPerShareRatio * deposited_amount) / FIXED_POINT_ACCURACY,
      grade: MVK_DECIMALS,
    })

    if (userReward) {
      if (acc[farmAddress]) acc[farmAddress] += userReward
      else acc[farmAddress] = userReward
    }
    return acc
  }, {})
}

// TODO: keep old calcs while farms rewards will no be tested
// const farmObj: UserFarmRewardsData = {
//   generalAccumulatedRewardsPerShare: farm.accumulated_rewards_per_share,
//   currentRewardPerBlock: farm.current_reward_per_block,
//   lastBlockUpdate: farm.last_block_update,
//   generalTotalRewards: farm.total_rewards,
//   generalPaidReward: farm.paid_rewards,
//   generalUnpaidReward: farm.unpaid_rewards,
//   totalLPTokenDeposited: farm.lp_token_balance,
//   infinite: farm.infinite,
//   myDepositedAmount: farm.farm_accounts[0].deposited_amount,
//   myParticipationRewardsPerShare: farm.farm_accounts[0].participation_rewards_per_share,
//   myAvailableFarmRewards: 0,
// }

// farmsKeys.forEach((farmKey) => {
//   const blockMultiplier = currentBlockLevel - farmAccount.lastBlockUpdate
//   const suspectedRewards = blockMultiplier * farmAccount.currentRewardPerBlock
//   const totalClaimedRewards = farmAccount.generalPaidReward + farmAccount.generalUnpaidReward
//   const totalFarmRewards = suspectedRewards * totalClaimedRewards
//   const totalPlannedRewards = farmAccount.generalTotalRewards
//   const reward =
//     totalFarmRewards > totalPlannedRewards && !farmAccount.infinite
//       ? totalPlannedRewards - totalClaimedRewards
//       : suspectedRewards
//   const tempAccumulatedRewardsPerShare =
//     farmAccount.generalAccumulatedRewardsPerShare +
//     (reward * FIXED_POINT_ACCURACY) / farmAccount.totalLPTokenDeposited

//   // Update user unclaimed rewards
//   const currentRewardsPerShare = tempAccumulatedRewardsPerShare - farmAccount.myParticipationRewardsPerShare
//   const usersAvailableFarmRewards = (currentRewardsPerShare * farmAccount.myDepositedAmount) / FIXED_POINT_ACCURACY

//   farmAccount.myAvailableFarmRewards = calcWithoutPrecision(String(usersAvailableFarmRewards))
