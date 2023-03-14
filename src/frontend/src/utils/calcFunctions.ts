import { State } from 'reducers'
import {
  FIXED_POINT_ACCURACY,
  PRECISION_NUMBER,
  SECONDS_PER_BLOCK,
  MVK_DECIMALS,
  XTZ_DECIMALS,
  DECIMALS_TO_SHOW,
} from './constants'
import { Doorman, Farm, Satellite_Rewards, Stake_History_Data } from './generated/graphqlTypes'
import { UserDoormanRewardsData, UserFarmRewardsData, UserSatelliteRewardsData } from './TypesAndInterfaces/User'
import { TokenType } from './TypesAndInterfaces/General'

/**
 * Calculates the MVK Loyalty Index (MLI) per the function in the litepaper
 * @param totalStakedMVK
 * @param totalMvkSupply
 */
export function calcMLI(totalMvkSupply: number | undefined, totalStakedMVK: number | undefined): number {
  const mvkSupplyActual = totalMvkSupply ?? 0
  const stakedMvkSupplyActual = totalStakedMVK ?? 0
  const mli = (stakedMvkSupplyActual / (mvkSupplyActual | 1)) * 10
  return mli
}

export function calcExitFee(totalMvkSupply: number | undefined, totalStakedMVK: number | undefined): number {
  const mli = calcMLI(totalMvkSupply, totalStakedMVK) * 10 //Need to multiply by 10 again so the MLI is adjusted properly to reflect the Litepaper
  const fee = 30 - 0.525 * mli + 0.0025 * mli ** 2
  return fee
}

/**
 * @param number -> number in regular form that we wan't to convert for usage in contract call
 * @param grage -> grage for 10, that we'll need to multiply number to convert it for usage in contract call
 *
 * By default fn will use MVK decimals amount
 * Math.floor is used to remove decimals that are more that allowed amount for token
 */
export const convertNumberForContractCall = ({
  number,
  grage = MVK_DECIMALS,
}: {
  number: number
  grage?: number
}): number => {
  return Math.floor(number * Math.pow(10, grage))
}

/**
 * @param number -> number in contract form that we wan't to convert for usage on client output
 * @param grage -> grage for 10, that we'll need to divide number to convert it for usage on client
 *
 * contract number form is number without decimals, this form is reached by multiplying reqular number by 10^(decimals amount different between different types of tokens)
 *
 * By default fn will use MVK decimals amount
 */
export const convertNumberForClient = ({
  number,
  grage = MVK_DECIMALS,
}: {
  number: number
  grage?: number
}): number => {
  return number / Math.pow(10, grage)
}

export const getDynamicDecimalsAmountForOutput = (number: number): number => {
  const decimalPart = String(number).split('.')[1]
  if (!decimalPart) return DECIMALS_TO_SHOW

  const matchesForLeadingZeroes = decimalPart.match(/^0+/)
  return matchesForLeadingZeroes ? matchesForLeadingZeroes[0].length + 2 : DECIMALS_TO_SHOW
}

export const getTokenDecimals = ({
  tokenType,
  tokenAddress,
  dipDupTokens,
}: {
  tokenType?: TokenType
  tokenAddress: string
  dipDupTokens: State['tokens']['dipDupTokens']
}): number | null => {
  if (tokenType === 'tez') return XTZ_DECIMALS

  const { metadata: { decimals = null } = {} } = dipDupTokens.find(({ contract }) => tokenAddress === contract) ?? {}

  return decimals ? Number(decimals) : null
}

export function calcTimeToBlock(currentBlockLevel?: number, endBlockLevel?: number) {
  if (!currentBlockLevel || !endBlockLevel) return 0

  const blockFrequency = SECONDS_PER_BLOCK //seconds
  const blocksToGo = endBlockLevel - currentBlockLevel
  const minutesUntilEndBlockReached = blocksToGo / (60 / blockFrequency)
  const hoursUntilEndBlockReached = minutesUntilEndBlockReached / 60
  const daysUntilEndBlockReached = hoursUntilEndBlockReached / 24
  return daysUntilEndBlockReached
}

export function calcWithoutPrecision(amount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  return numberMu > 0 ? numberMu / PRECISION_NUMBER : 0
}

export function convertFromIndexerToRegNum(amount: string | number, decimalsAmount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  const decimals = Number(decimalsAmount)

  return numberMu / Math.pow(10, decimals)
}

export function calcWithoutMu(amount: string | number): number {
  const numberMu = parseFloat(amount?.toString()) || 0
  return numberMu > 0 ? numberMu / 1000000 : 0
}

export function calcWithoutDecimals(amount: string | number, decimals: number): number {
  const numberWithDecimals = parseFloat(amount?.toString()) || 0
  return numberWithDecimals > 0 ? numberWithDecimals / 10 ** decimals : 0
}
// TODO: remove mutations in these 3 fns
export function calcUsersDoormanRewards({
  userDoormanRewardsFromGQL,
  mySMvkTokenBalance = 0,
}: {
  userDoormanRewardsFromGQL?: Doorman
  mySMvkTokenBalance: number
}): UserDoormanRewardsData | undefined {
  const myDoormanRewardsData: UserDoormanRewardsData = {
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
  return myDoormanRewardsData
}

export function calcUsersFarmRewards({
  currentBlockLevel,
  userFarmsRewardsFromGQL,
}: {
  currentBlockLevel: number
  userFarmsRewardsFromGQL: Array<Farm>
}): Record<string, UserFarmRewardsData> | undefined {
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
}): UserSatelliteRewardsData | undefined {
  const mySatelliteRewardsData: UserSatelliteRewardsData = {
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
  return mySatelliteRewardsData
}

const USER_ACTIONS_TYPES = {
  STAKE: 0,
  UNSTAKE: 1,
  FARM_CLAIM: 2,
  COMPOUND: 3,
  SATELLITE_REWARD: 4,
}

export function calcUsersRewardsToDate(usetStakesData?: Array<Stake_History_Data>) {
  if (!usetStakesData) return { farmRewards: 0, satelliteRewards: 0, doormanRewards: 0, actionsHistory: [] }
  return usetStakesData.reduce<{
    farmRewards: number
    satelliteRewards: number
    doormanRewards: number
    actionsHistory: State['wallet']['user']['actionsHistory']
  }>(
    (acc, { type, final_amount, desired_amount, id }) => {
      if (type === USER_ACTIONS_TYPES.FARM_CLAIM) {
        acc.farmRewards += calcWithoutPrecision(final_amount)
      }

      if (type === USER_ACTIONS_TYPES.COMPOUND) {
        acc.doormanRewards += calcWithoutPrecision(final_amount)
      }

      if (type === USER_ACTIONS_TYPES.SATELLITE_REWARD) {
        acc.satelliteRewards += calcWithoutPrecision(final_amount)
      }

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

      const amount = calcWithoutPrecision(desired_amount)
      const totalAmount = calcWithoutPrecision(final_amount)
      const historyDataItem: State['wallet']['user']['actionsHistory'][number] = {
        action: actionName,
        amount,
        totalAmount,
        fee: isUnstake ? ((amount - totalAmount) / amount) * 100 : 0,
        id,
      }

      acc.actionsHistory.push(historyDataItem)
      return acc
    },
    { farmRewards: 0, satelliteRewards: 0, doormanRewards: 0, actionsHistory: [] },
  )
}

export const calcDiffBetweenTwoNumbersInPersentage = (num1: number, num2: number): number => {
  if (num1 === 0 && num2 === 0) return 0
  const topPart = num1 - num2
  const bottomPart = (num1 + num2) / 2

  return (topPart / bottomPart) * 100
}

export const percentageDifference = (a: number, b: number): number => {
  const twoNumberDifference = (a / b - 1) * 100
  return Number(twoNumberDifference.toFixed(2))
}

export const getNumberInBounds = (minBound: number, maxBound: number, numberToPutInBound: number) => {
  return Math.max(minBound, Math.min(maxBound, numberToPutInBound))
}
