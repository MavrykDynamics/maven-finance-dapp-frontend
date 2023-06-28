import { GetUserDataSubscription } from 'utils/__generated__/graphql'
import { UserContext, UserMetadataType } from '../user.provider.types'
import dayjs from 'dayjs'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

export const normalizeUserMetadata = ({ indexerData }: { indexerData: GetUserDataSubscription }): UserMetadataType => {
  const {
    delegations,
    stakes_history_data,
    satellites: [satellite],
    council_council_members: [counsilMember],
    break_glass_council_members: [bgCounsilMember],
    vesting_vestees: [vestee],
  } = indexerData.mavryk_user[0]

  const satelliteAvatar = satellite?.image ?? null
  const counsilAvatar = counsilMember?.image ?? null
  const breakGlassAvatar = bgCounsilMember?.image ?? null

  const satelliteMvkIsDelegatedTo = delegations[0]?.satellite.user.address ?? null
  const isSatellite = satellite?.status === 0 && satellite?.currently_registered
  const isVestee = vestee?.end_vesting_timestamp && dayjs().diff(vestee.end_vesting_timestamp) <= 0
  const { actionsHistory, gatheredDoormanRewards, gatheredFarmRewards, gatheredSatellitesRewards } =
    calcUsersRewardsToDate(stakes_history_data)

  return {
    userAvatars: {
      mainAvatar: satelliteAvatar ?? counsilAvatar ?? breakGlassAvatar,
      satelliteAvatar,
      counsilAvatar,
      breakGlassAvatar,
    },
    isVestee,
    isSatellite,
    satelliteMvkIsDelegatedTo,
    actionsHistory,
    gatheredDoormanRewards,
    gatheredFarmRewards,
    gatheredSatellitesRewards,

    // TODO: use SATELLITE_CYCLE_DATA_QUERY
    isNewlyRegisteredSatellite: false,
    govActionsCount: 0,
  }
}

const USER_ACTIONS_TYPES = {
  STAKE: 0,
  UNSTAKE: 1,
  FARM_CLAIM: 2,
  COMPOUND: 3,
  SATELLITE_REWARD: 4,
}

const calcUsersRewardsToDate = (
  usetStakesData: GetUserDataSubscription['mavryk_user'][number]['stakes_history_data'],
) => {
  return usetStakesData.reduce<{
    gatheredFarmRewards: number
    gatheredSatellitesRewards: number
    gatheredDoormanRewards: number
    actionsHistory: UserContext['actionsHistory']
  }>(
    (acc, { type, final_amount, desired_amount, id }) => {
      const convertedFinalAmount = convertNumberForClient({ number: final_amount, grade: MVK_DECIMALS })
      const convertedDesiredAmount = convertNumberForClient({ number: desired_amount, grade: MVK_DECIMALS })

      if (type === USER_ACTIONS_TYPES.FARM_CLAIM) acc.gatheredFarmRewards += convertedFinalAmount

      if (type === USER_ACTIONS_TYPES.COMPOUND) acc.gatheredDoormanRewards += convertedFinalAmount

      if (type === USER_ACTIONS_TYPES.SATELLITE_REWARD) acc.gatheredSatellitesRewards += convertedFinalAmount

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

      acc.actionsHistory.push({
        action: actionName,
        amount: convertedDesiredAmount,
        totalAmount: convertedFinalAmount,
        fee: isUnstake ? ((convertedDesiredAmount - convertedFinalAmount) / convertedDesiredAmount) * 100 : 0,
        id,
      })
      return acc
    },
    { gatheredFarmRewards: 0, gatheredSatellitesRewards: 0, gatheredDoormanRewards: 0, actionsHistory: [] },
  )
}
