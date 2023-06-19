import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  SATELLITE_ACTIONS_COUNT_QUERY,
  SATELLITE_ACTIONS_COUNT_QUERY_NAME,
  SATELLITE_ACTIONS_COUNT_QUERY_VARIABLE,
} from 'gql/queries/getSatelliteGovernanceStorage'
import {
  USER_INFO_QUERY,
  USER_INFO_QUERY_NAME,
  USER_INFO_QUERY_VARIABLES,
  USER_REWARDS_QUERY,
  USER_REWARDS_QUERY_NAME,
  USER_REWARDS_QUERY_VARIABLES,
  SATELLITE_CYCLE_DATA_QUERY,
  SATELLITE_CYCLE_DATA_QUERY_NAME,
  SATELLITE_CYCLE_DATA_QUERY_VARIABLE,
} from 'gql/queries'
import { UserState, DEFAULT_USER } from 'reducers/wallet'
import { MavrykUserGraphQl } from 'utils/TypesAndInterfaces/User'
import {
  calcUsersRewardsToDate,
  calcUsersDoormanRewards,
  calcUsersSatelliteRewards,
  calcUsersFarmRewards,
  convertNumberForClient,
} from 'utils/calcFunctions'
import { MVK_DECIMALS, XTZ_DECIMALS } from 'utils/constants'
import { Satellite, Vesting } from 'utils/generated/graphqlTypes'
import { UserMTokenType } from 'providers/TokensProvider/tokens.provider.types'

export type SatelliteSnapshot = {
  cycle: number
  ready: boolean
}

/**
 * @param snapshots satellite snapshots for cycle data
 * @param currentCycle current active cycle
 * @returns boolean value for newly registered satellite
 */
export function detectNewlyRegisteredSatellite(snapshots: SatelliteSnapshot[], currentCycle: number) {
  // If highest cycle one is false then not registered/ineligable as a satellite
  if (snapshots.length < 2 && snapshots.length > 0) {
    const { cycle, ready } = snapshots[0]
    return !ready || cycle === currentCycle
  } else if (snapshots.length >= 2) {
    const { ready: r1 } = snapshots[0]
    const { ready: r2 } = snapshots[1]

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

export const fetchUserData = async (accountPkh: string, currentBlockLevel: number | undefined = 0) => {
  try {
    const userInfoFromIndexer = await fetchFromIndexer(
      USER_INFO_QUERY,
      USER_INFO_QUERY_NAME,
      USER_INFO_QUERY_VARIABLES(accountPkh),
    )

    const userRewardsData = await fetchFromIndexer(
      USER_REWARDS_QUERY,
      USER_REWARDS_QUERY_NAME,
      USER_REWARDS_QUERY_VARIABLES(accountPkh),
    )

    // fetch current cycle data and current user cycle data
    const satelliteCycleData = await fetchFromIndexer(
      SATELLITE_CYCLE_DATA_QUERY,
      SATELLITE_CYCLE_DATA_QUERY_NAME,
      SATELLITE_CYCLE_DATA_QUERY_VARIABLE(accountPkh),
    )
    const { cycle_id: currentCycle, satellite_snapshots } = satelliteCycleData.governance[0]
    const isNewSatellite = detectNewlyRegisteredSatellite(satellite_snapshots, currentCycle)

    const {
      smvk_balance = 0,
      m_token_accounts = [],
      delegations = [],
      stakes_history_data = [],
      satellites,
      council_council_members,
      break_glass_council_members,
      activeSatelliteRecord: [activeSatelliteRecord = null] = [],
      vesteeRecord: [vesteeRecord = null] = [],
    } = (userInfoFromIndexer?.mavryk_user?.[0] ?? {}) as MavrykUserGraphQl & {
      activeSatelliteRecord: Array<Satellite>
      vesteeRecord: Array<Vesting>
    }

    let satelliteActionsCount = 0
    if (Boolean(activeSatelliteRecord) && accountPkh) {
      const satelliteActionsData = await fetchFromIndexer(
        SATELLITE_ACTIONS_COUNT_QUERY,
        SATELLITE_ACTIONS_COUNT_QUERY_NAME,
        SATELLITE_ACTIONS_COUNT_QUERY_VARIABLE(accountPkh),
      )

      // TODO wait when will be added cycle_id per action
      satelliteActionsCount = satelliteActionsData.governance_satellite[0].actions.length
    }

    // Getting user avatar
    const satelliteAvatar = satellites?.[0]?.image ?? null
    const counsilAvatar = council_council_members?.[0]?.image ?? null
    const breakGlassAvatar = break_glass_council_members?.[0]?.image ?? null
    const userAvatars = {
      mainAvatar: satelliteAvatar ?? counsilAvatar ?? breakGlassAvatar,
      satelliteAvatar,
      counsilAvatar,
      breakGlassAvatar,
    }

    const interestRateDecimals = userRewardsData?.lending_controller?.[0]?.interest_rate_decimals ?? 0
    const normalizedMTokens = m_token_accounts.reduce<Array<UserMTokenType>>((acc, tokenData) => {
      acc.push({
        lendedAmount: tokenData.balance,
        balance: tokenData.balance + tokenData.rewards_earned,
        tokenAddress: tokenData.m_token.address,
        reward_index: tokenData.reward_index,
        rewards_earned: tokenData.rewards_earned,
        interestRateDecimals,
      })
      return acc
    }, [])

    const userInfo: UserState = {
      ...DEFAULT_USER,
      userMTokens: normalizedMTokens,
      satelliteMvkIsDelegatedTo: delegations?.[0]?.satellite?.user?.address ?? '',
      isSatellite: Boolean(activeSatelliteRecord),
      isVestee: Boolean(vesteeRecord),
      isNewlyRegisteredSatellite: isNewSatellite,
      govActionsCount: satelliteActionsCount,
      userAvatars,
    }

    // ----- GETTING USER'S REWARDS *START* -----
    userInfo.availableDoormanRewards = calcUsersDoormanRewards({
      mySMvkTokenBalance: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
      userDoormanRewardsFromGQL: userRewardsData?.doorman?.[0],
    })
    userInfo.availableSatellitesRewards = calcUsersSatelliteRewards({
      mySMvkTokenBalance: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
      userSatelliteRewardsFromGQL: userRewardsData?.satellite_rewards?.[0],
    })
    userInfo.availableFarmRewards = calcUsersFarmRewards({
      currentBlockLevel: currentBlockLevel,
      userFarmsRewardsFromGQL: userRewardsData?.farm ?? [],
    })

    /**
     * @description userInfo.mTokens.reduce
     * getting how much user has earned by loans,
     * we are receiving large number that we need to conver to people readable format
     * to convert it we need to get decimals for loan asset we are getting rewards of,
     * and general decimal places for loans in general, and if we have all decimals we can calc correct number, the formula is:
     * (reward amount in blockchain number) / (10 ** decimals for loanasset + decimals for loans in general) * (rate of the loan asset to convert it all to $)
     */
    userInfo.availableLoansRewards =
      normalizedMTokens.reduce((acc, { rewards_earned, interestRateDecimals }) => {
        return (acc += convertNumberForClient({ number: rewards_earned, grade: interestRateDecimals + XTZ_DECIMALS }))
      }, 0) ?? 0

    const { actionsHistory, gatheredDoormanRewards, gatheredFarmRewards, gatheredSatellitesRewards } =
      calcUsersRewardsToDate(stakes_history_data)

    userInfo.gatheredDoormanRewards = gatheredDoormanRewards
    userInfo.gatheredFarmRewards = gatheredFarmRewards
    userInfo.gatheredSatellitesRewards = gatheredSatellitesRewards
    userInfo.actionsHistory = actionsHistory
    // ----- GETTING USER'S REWARDS *END* -----

    return userInfo
  } catch (error) {
    console.error(error)
    if (error instanceof Error) {
      throw error
    }
    return DEFAULT_USER
  }
}

export const UPDATE_USER_DATA = 'UPDATE_USER_DATA'
export const updateUserData = (newAccAddress?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    preferences: { headData: { level = 0 } = {} },
    wallet: { accountPkh },
  } = getState()

  const userAddressToLoadData = newAccAddress ?? accountPkh

  try {
    if (userAddressToLoadData) {
      const userData = await fetchUserData(userAddressToLoadData, level)

      dispatch({
        type: UPDATE_USER_DATA,
        userData: userData,
        accountPkh: userAddressToLoadData,
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}
