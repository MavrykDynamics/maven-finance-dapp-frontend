import dayjs from 'dayjs'

// types
import { GetUserActionsHistoryDataQuery, GetUserDataQuery, GetUserRewardsDataQuery } from 'utils/__generated__/graphql'
import { UserMetadataType, UserRewardsType } from '../user.provider.types'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { getUserDoomanRewards, getUserSatelliteRewards, getUsersFarmRewards } from './userRewards.helpers'

// consts
import { MVK_DECIMALS } from 'utils/constants'
import { DEFAULT_USER_AVATAR } from './user.consts'
import { currentIndexerLevelProxy } from 'providers/common/utils/observeCurrentIndexerLevel'

export const normalizeUser = ({ indexerData }: { indexerData: GetUserDataQuery }): UserMetadataType => {
  const {
    delegations,
    satellites: [satellite],
    council_council_members: [counsilMember],
    break_glass_council_members: [bgCounsilMember],
    vesting_vestees: [vestee],
    governance_satellite_snapshots,
    governance_satellite_action_initiators_aggregate,
  } = indexerData.mavryk_user[0]

  const satelliteAvatar = satellite?.image ?? null
  const counsilAvatar = counsilMember?.image ?? null
  const breakGlassAvatar = bgCounsilMember?.image ?? null

  const satelliteMvkIsDelegatedTo = delegations[0]?.satellite.user.address ?? null
  const isSatellite = satellite?.status === 0 && satellite?.currently_registered
  const isVestee = vestee?.end_vesting_timestamp && dayjs().diff(vestee.end_vesting_timestamp) <= 0
  const isMavrykCouncil = Boolean(counsilMember?.user?.address)
  const isBreakGlassCouncil = Boolean(bgCounsilMember?.user?.address)

  return {
    userAvatars: {
      mainAvatar: satelliteAvatar ?? counsilAvatar ?? breakGlassAvatar ?? DEFAULT_USER_AVATAR,
      satelliteAvatar,
      counsilAvatar,
      breakGlassAvatar,
    },
    isVestee,
    isMavrykCouncil,
    isBreakGlassCouncil,
    isSatellite,
    userSatelliteName: satellite?.name ?? null,
    satelliteMvkIsDelegatedTo,

    isNewlyRegisteredSatellite: checkWhetherUserNewlyRegisteredSatellite(governance_satellite_snapshots),
    govActionsCount: governance_satellite_action_initiators_aggregate.aggregate?.count ?? 0,
  }
}

export const normalizeUserRewards = ({
  rewardsIndexerData,
  userProposalRewards,
}: {
  rewardsIndexerData: GetUserRewardsDataQuery['mavryk_user'][number]
  userProposalRewards: GetUserRewardsDataQuery['governance_proposal']
}): UserRewardsType => {
  const { doorman_stake_accounts, satellite_rewardss, smvk_balance, farm_accounts } = rewardsIndexerData

  const availableDoormanRewards = doorman_stake_accounts[0]
    ? getUserDoomanRewards({
        userDoormanRewardsDataFromIndexer: doorman_stake_accounts[0],
        userSmvkBalance: smvk_balance,
      })
    : 0
  const availableSatellitesRewards = satellite_rewardss[0]
    ? getUserSatelliteRewards({
        userSmvkBalance: smvk_balance,
        userSatelliteRewardsDataFromIndexer: satellite_rewardss[0],
      })
    : 0
  const availableProposalRewards = userProposalRewards.map(({ id }) => id)

  return {
    gatheredDoormanRewards: convertNumberForClient({
      number: doorman_stake_accounts[0]?.total_exit_fee_rewards_claimed ?? 0,
      grade: MVK_DECIMALS,
    }),
    gatheredSatellitesRewards: convertNumberForClient({
      number: doorman_stake_accounts[0]?.total_satellite_rewards_claimed ?? 0,
      grade: MVK_DECIMALS,
    }),
    gatheredFarmRewards: farm_accounts.reduce((acc, { claimed_rewards }) => {
      return (acc += convertNumberForClient({
        number: claimed_rewards,
        grade: MVK_DECIMALS,
      }))
    }, 0),
    availableFarmRewards: getUsersFarmRewards({
      userFarmsRewardsDataFromIndexer: farm_accounts,
      currentLvl: currentIndexerLevelProxy.currentIndexedLevel,
    }),
    availableSatellitesRewards,
    availableDoormanRewards,
    availableProposalRewards,
    farmAccounts: farm_accounts,
  }
}

const USER_ACTIONS_TYPES = {
  STAKE: 0,
  UNSTAKE: 1,
  FARM_CLAIM: 2,
  COMPOUND: 3,
  SATELLITE_REWARD: 4,
}

const getOperationName = (operation: number) => {
  switch (operation) {
    case USER_ACTIONS_TYPES.STAKE:
      return 'Stake'
    case USER_ACTIONS_TYPES.UNSTAKE:
      return 'Unstake'
    case USER_ACTIONS_TYPES.FARM_CLAIM:
      return 'Farm Claim'
    case USER_ACTIONS_TYPES.COMPOUND:
      return 'Compound'
    case USER_ACTIONS_TYPES.SATELLITE_REWARD:
      return 'Satellite Reward'
    default:
      return null
  }
}

export const normalizeUserHistoryData = (
  userHistoryFromIndexer: GetUserActionsHistoryDataQuery['mavryk_user'][number]['stakes_history_data'],
) => {
  return userHistoryFromIndexer.reduce<
    Array<{
      action: string
      amount: number
      totalAmount: number
      fee: number
      id: number
    }>
  >((acc, { type, final_amount, desired_amount, id }) => {
    const convertedFinalAmount = convertNumberForClient({ number: final_amount, grade: MVK_DECIMALS })
    const convertedDesiredAmount = convertNumberForClient({ number: desired_amount, grade: MVK_DECIMALS })

    const isUnstake = type === USER_ACTIONS_TYPES.UNSTAKE
    const actionName = getOperationName(type)

    if (!actionName) return acc

    acc.push({
      action: actionName,
      amount: convertedDesiredAmount,
      totalAmount: convertedFinalAmount,
      fee: isUnstake ? ((convertedDesiredAmount - convertedFinalAmount) / convertedDesiredAmount) * 100 : 0,
      id,
    })
    return acc
  }, [])
}

/**
 * @param snapshots satellite snapshots for cycle data
 * @returns boolean value for newly registered satellite (newly registered is satellite who registered on current cycle)
 */
const checkWhetherUserNewlyRegisteredSatellite = (
  userSatelliteSnapshots: GetUserDataQuery['mavryk_user'][number]['governance_satellite_snapshots'],
) => {
  const lastNotReadySnapshot = userSatelliteSnapshots.find(({ ready }) => ready === false)

  if (lastNotReadySnapshot) {
    const firstReadyAfterNotReadySnapshot = userSatelliteSnapshots.find(
      ({ cycle, ready }) => ready === true && cycle === lastNotReadySnapshot.next_snapshot_cycle_id,
    )

    // if first ready snapsot after not ready cycle === current gov cycle satellite is newly registered
    if (
      firstReadyAfterNotReadySnapshot &&
      firstReadyAfterNotReadySnapshot.cycle === firstReadyAfterNotReadySnapshot.governance.cycle_id
    )
      return true
  }

  return false
}
