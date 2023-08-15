import { GetUserActionsHistoryDataQuery, GetUserDataQuery } from 'utils/__generated__/graphql'
import { UserMetadataType } from '../user.provider.types'
import dayjs from 'dayjs'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'
import { getUserDoomanRewards, getUserSatelliteRewards } from './userRewards.helpers'
import { DEFAULT_USER_AVATAR } from './user.consts'

export const normalizeUser = ({ indexerData }: { indexerData: GetUserDataQuery }): UserMetadataType => {
  const {
    delegations,
    satellites: [satellite],
    council_council_members: [counsilMember],
    break_glass_council_members: [bgCounsilMember],
    vesting_vestees: [vestee],
    governance_satellite_snapshots,
    governance_satellite_action_initiators_aggregate,

    // rewards data
    smvk_balance,
    farm_accounts,
    satellite_rewardss,
    doorman_stake_accounts,
  } = indexerData.mavryk_user[0]

  const availableProposalRewards = indexerData.governance_proposal.map(({ id }) => id)

  const satelliteAvatar = satellite?.image ?? null
  const counsilAvatar = counsilMember?.image ?? null
  const breakGlassAvatar = bgCounsilMember?.image ?? null

  const satelliteMvkIsDelegatedTo = delegations[0]?.satellite.user.address ?? null
  const isSatellite = satellite?.status === 0 && satellite?.currently_registered
  const isVestee = vestee?.end_vesting_timestamp && dayjs().diff(vestee.end_vesting_timestamp) <= 0
  // const { actionsHistory, gatheredDoormanRewards, gatheredFarmRewards, gatheredSatellitesRewards } =
  //   calcUsersRewardsToDate(stakes_history_data)

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

  return {
    userAvatars: {
      mainAvatar: satelliteAvatar ?? counsilAvatar ?? breakGlassAvatar ?? DEFAULT_USER_AVATAR,
      satelliteAvatar,
      counsilAvatar,
      breakGlassAvatar,
    },
    isVestee,
    isSatellite,
    satelliteMvkIsDelegatedTo,
    gatheredDoormanRewards: 0,
    gatheredFarmRewards: 0,
    gatheredSatellitesRewards: 0,
    availableSatellitesRewards,
    availableDoormanRewards,
    availableProposalRewards,
    farmAccounts: farm_accounts,

    isNewlyRegisteredSatellite: checkWhetherUserNewlyRegisteredSatellite(governance_satellite_snapshots),
    govActionsCount: governance_satellite_action_initiators_aggregate.aggregate?.count ?? 0,
  }
}

const USER_ACTIONS_TYPES = {
  STAKE: 0,
  UNSTAKE: 1,
  FARM_CLAIM: 2,
  COMPOUND: 3,
  SATELLITE_REWARD: 4,
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
    const actionName =
      type === USER_ACTIONS_TYPES.STAKE
        ? 'Stake'
        : type === USER_ACTIONS_TYPES.UNSTAKE
        ? 'Unstake'
        : type === USER_ACTIONS_TYPES.FARM_CLAIM
        ? 'Farm Claim'
        : type === USER_ACTIONS_TYPES.COMPOUND
        ? 'Compound'
        : 'Satellite Reward'

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

// const calcUsersRewardsToDate = (usetStakesData: GetUserDataQuery['mavryk_user'][number]['stakes_history_data']) => {
//   return usetStakesData.reduce<{
//     gatheredFarmRewards: number
//     gatheredSatellitesRewards: number
//     gatheredDoormanRewards: number
//     actionsHistory: UserContext['actionsHistory']
//   }>(
//     (acc, { type, final_amount, desired_amount, id }) => {
//       const convertedFinalAmount = convertNumberForClient({ number: final_amount, grade: MVK_DECIMALS })
//       const convertedDesiredAmount = convertNumberForClient({ number: desired_amount, grade: MVK_DECIMALS })

//       if (type === USER_ACTIONS_TYPES.FARM_CLAIM) acc.gatheredFarmRewards += convertedFinalAmount

//       if (type === USER_ACTIONS_TYPES.COMPOUND) acc.gatheredDoormanRewards += convertedFinalAmount

//       if (type === USER_ACTIONS_TYPES.SATELLITE_REWARD) acc.gatheredSatellitesRewards += convertedFinalAmount

//       const isUnstake = type === USER_ACTIONS_TYPES.UNSTAKE
//       const actionName =
//         type === USER_ACTIONS_TYPES.STAKE
//           ? 'Stake'
//           : type === USER_ACTIONS_TYPES.UNSTAKE
//           ? 'Unstake'
//           : type === USER_ACTIONS_TYPES.FARM_CLAIM
//           ? 'Farm Claim'
//           : type === USER_ACTIONS_TYPES.COMPOUND
//           ? 'Compound'
//           : 'Satellite Reward'

//       acc.actionsHistory.push({
//         action: actionName,
//         amount: convertedDesiredAmount,
//         totalAmount: convertedFinalAmount,
//         fee: isUnstake ? ((convertedDesiredAmount - convertedFinalAmount) / convertedDesiredAmount) * 100 : 0,
//         id,
//       })
//       return acc
//     },
//     { gatheredFarmRewards: 0, gatheredSatellitesRewards: 0, gatheredDoormanRewards: 0, actionsHistory: [] },
//   )
// }

/**
 * @param snapshots satellite snapshots for cycle data
 * @param currentCycle current active cycle
 * @returns boolean value for newly registered satellite
 * TODO: @AlexBelz123 add more detailed docs here
 */
const checkWhetherUserNewlyRegisteredSatellite = (
  userSatelliteSnapshots: GetUserDataQuery['mavryk_user'][number]['governance_satellite_snapshots'],
) => {
  // If highest cycle one is false then not registered/ineligable as a satellite
  if (userSatelliteSnapshots.length < 2 && userSatelliteSnapshots.length > 0) {
    const {
      cycle,
      ready,
      governance: { cycle_id: currentCycle },
    } = userSatelliteSnapshots[0]
    return !ready || cycle === currentCycle
  } else if (userSatelliteSnapshots.length >= 2) {
    const { ready: r1 } = userSatelliteSnapshots[0]
    const { ready: r2 } = userSatelliteSnapshots[1]

    if (!r1) return true

    // Check those 2 objects, if both are true -> not newly registered.
    if (r1 && r2) {
      return false
    }
    // If lowest cycle one is false and hgihest cycle one is true then newly registered.
    if (!r2 && r1) {
      return true
    }
  }
  return false
}
