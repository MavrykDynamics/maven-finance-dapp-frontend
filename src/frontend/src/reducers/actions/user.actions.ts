import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
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

import {
  SATELLITE_ACTIONS_COUNT_QUERY,
  SATELLITE_ACTIONS_COUNT_QUERY_NAME,
  SATELLITE_ACTIONS_COUNT_QUERY_VARIABLE,
} from 'gql/queries/getSatelliteGovernanceStorage'
import {
  USER_LENDING_DATA_QUERY,
  USER_LENDING_DATA_QUERY_NAME,
  USER_LENDING_DATA_QUERY_VARIABLE,
} from 'gql/queries/getLoansStorage'
import { getAvaliableCollaterals } from 'pages/Loans/Actions/getLoansData.actions'
import { getAssetMetadata, isTezosAsset } from 'pages/Loans/Loans.helpers'
import { normalizeUserLending } from 'pages/Loans/Loans.normalizer'
import { State } from 'reducers'
import { UserState, DEFAULT_USER } from 'reducers/wallet'
import { MTokenType, MavrykUserGraphQl } from 'utils/TypesAndInterfaces/User'
import {
  calcUsersRewardsToDate,
  calcUsersDoormanRewards,
  calcUsersSatelliteRewards,
  calcUsersFarmRewards,
  convertNumberForClient,
} from 'utils/calcFunctions'
import {
  MVK_DECIMALS,
  MVK_TOKEN_SYMBOL,
  SMVK_TOKEN_SYMBOL,
  USER_TOKEN_TYPE_COLLATERAL,
  USER_TOKEN_TYPE_DEFAULT,
  USER_TOKEN_TYPE_MTOKEN,
  USER_TOKEN_TYPE_WHITELIST,
  XTZ_DECIMALS,
  XTZ_TOKEN_SYMBOL,
} from 'utils/constants'
import { Lending_Controller_Loan_Token, Satellite, Vesting } from 'utils/generated/graphqlTypes'
import { getSymbolAndNameFromCollaterealGqlname } from 'utils/parse'

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

export const fetchUserData = async (
  accountPkh: string,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
  avaliableCollaterals: State['tokens']['avaliableCollaterals'],
  whitelistTokens: State['tokens']['whitelistTokens'],
  currentBlockLevel: number | undefined = 0,
) => {
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
      mvk_balance = 0,
      smvk_balance = 0,
      m_token_accounts = [],
      delegations = [],
      stakes_history_data = [],
      activeSatelliteRecord: [activeSatelliteRecord = null] = [],
      vesteeRecord: [vesteeRecord = null] = [],
    } = (userInfoFromIndexer?.mavryk_user?.[0] ?? {}) as MavrykUserGraphQl & {
      activeSatelliteRecord: Array<Satellite>
      vesteeRecord: Array<Vesting>
    }
    let satelliteActionsCount = 0
    if (Boolean(activeSatelliteRecord)) {
      const satelliteActionsData = await fetchFromIndexer(
        SATELLITE_ACTIONS_COUNT_QUERY,
        SATELLITE_ACTIONS_COUNT_QUERY_NAME,
        SATELLITE_ACTIONS_COUNT_QUERY_VARIABLE(accountPkh),
      )

      satelliteActionsCount = satelliteActionsData.governance_satellite[0].actions.length
    }

    const loanTokens = userRewardsData?.lending_controller?.[0]?.loan_tokens as Array<Lending_Controller_Loan_Token>
    const interestRateDecimals = userRewardsData?.lending_controller?.[0]?.interest_rate_decimals ?? 0

    const normalizedMTokens = m_token_accounts.reduce<Array<MTokenType>>((acc, tokenData) => {
      const { oracle_id } =
        loanTokens?.find(({ loan_token_name }) => loan_token_name === tokenData.m_token.loan_token_name) ?? {}

      if (!oracle_id) return acc

      const loanTokenMetadata = getAssetMetadata({
        tokenName: tokenData.m_token.loan_token_name,
        tokenAddress: tokenData.m_token.address,
        dipDupTokens,
        feeds,
        oracleId: String(oracle_id),
      })

      if (!loanTokenMetadata) return acc

      const normalizedBalance = convertNumberForClient({ number: tokenData.balance, grade: loanTokenMetadata.decimals })
      const normalizedEarnedRewards = convertNumberForClient({
        number: tokenData.rewards_earned,
        grade: interestRateDecimals + loanTokenMetadata.decimals,
      })
      const normalizedIndexRewards = convertNumberForClient({
        number: tokenData.reward_index,
        grade: interestRateDecimals + loanTokenMetadata.decimals,
      })

      acc.push({
        lendedAmount: normalizedBalance,
        balance: normalizedBalance + normalizedEarnedRewards,
        usdBalance: normalizedBalance + normalizedEarnedRewards * loanTokenMetadata.rate,
        tokenRate: loanTokenMetadata.rate,
        tokenSymbol: isTezosAsset(loanTokenMetadata.symbol) ? 'tezos' : loanTokenMetadata.symbol,
        tokenName: isTezosAsset(loanTokenMetadata.symbol) ? `m${loanTokenMetadata.symbol}` : loanTokenMetadata.name,
        tokenAddress: tokenData.m_token.address,
        reward_index: normalizedIndexRewards,
        rewards_earned: normalizedEarnedRewards,
        icon: loanTokenMetadata.icon ?? null,
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
    }

    // ----- GETTING USER'S TOKENS BALANCES, THAT ARE USED ACROSS DAPP *START* -----
    // We 100% should have are mvk and smvk, need this set to not make 2+ same calls for balance
    const userTokenNames = new Set<string>([XTZ_TOKEN_SYMBOL, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL])

    const collateralTokens = await avaliableCollaterals.reduce<Promise<UserState['userTokens']>>(
      async (promiseAcc, { address, symbol: collateralSymbol, gqlName }) => {
        const acc = await promiseAcc
        const { name, symbol } = getSymbolAndNameFromCollaterealGqlname(collateralSymbol, gqlName)
        if (userTokenNames.has(symbol)) return acc

        const fetchedTokenData = await (
          await fetch(
            `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}&token.contract.in=${address}`,
          )
        ).json()

        const fetchedBalance = Number(fetchedTokenData?.[0]?.balance ?? 0)
        const fetchedDecimals = Number(fetchedTokenData?.[0]?.token?.metadata?.decimals ?? 0)
        const balance =
          fetchedBalance && fetchedDecimals
            ? convertNumberForClient({ number: fetchedBalance, grade: fetchedDecimals })
            : 0

        acc[symbol] = {
          balance,
          name,
          symbol,
          type: USER_TOKEN_TYPE_COLLATERAL,
        }

        userTokenNames.add(symbol)
        return acc
      },
      Promise.resolve({}),
    )

    const mTokens = await normalizedMTokens.reduce<Promise<UserState['userTokens']>>(
      async (promiseAcc, { tokenSymbol, tokenName, balance, icon }) => {
        const acc = await promiseAcc
        if (userTokenNames.has(tokenName)) return acc

        acc[tokenName] = {
          balance,
          name: tokenName,
          symbol: tokenSymbol,
          type: USER_TOKEN_TYPE_MTOKEN,
        }

        userTokenNames.add(tokenName)
        return acc
      },
      Promise.resolve({}),
    )

    const whitelistTokensBalances = await whitelistTokens.reduce<Promise<UserState['userTokens']>>(
      async (promiseAcc, { address, symbol: whitelistSymbol }) => {
        const acc = await promiseAcc
        const { name, symbol } = getSymbolAndNameFromCollaterealGqlname('', whitelistSymbol)
        if (userTokenNames.has(symbol) || !symbol) return acc

        // TODO: check whether actuall address is working to fetch balance (when here will be smth more exept mvk and xtz that are fetching by default)
        const fetchedTokenData = await (
          await fetch(
            `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}&token.contract.in=${address}`,
          )
        ).json()

        const fetchedBalance = Number(fetchedTokenData?.[0]?.balance ?? 0)
        const fetchedDecimals = Number(fetchedTokenData?.[0]?.token?.metadata?.decimals ?? 0)
        const balance =
          fetchedBalance && fetchedDecimals
            ? convertNumberForClient({ number: fetchedBalance, grade: fetchedDecimals })
            : 0

        acc[symbol] = {
          balance,
          name,
          symbol,
          type: USER_TOKEN_TYPE_WHITELIST,
        }

        userTokenNames.add(symbol)
        return acc
      },
      Promise.resolve({}),
    )

    const fetchedUserXtzBalance = await (
      await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${accountPkh}/balance`)
    ).json()

    userInfo.userTokens = {
      ...collateralTokens,
      ...whitelistTokensBalances,
      ...mTokens,
      [MVK_TOKEN_SYMBOL]: {
        balance: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }),
        name: 'MVK',
        symbol: MVK_TOKEN_SYMBOL,
        type: USER_TOKEN_TYPE_DEFAULT,
      },
      [SMVK_TOKEN_SYMBOL]: {
        balance: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
        name: 'sMVK',
        symbol: MVK_TOKEN_SYMBOL,
        type: USER_TOKEN_TYPE_DEFAULT,
      },
      [XTZ_TOKEN_SYMBOL]: {
        balance: convertNumberForClient({ number: fetchedUserXtzBalance, grade: XTZ_DECIMALS }),
        name: 'XTZ',
        symbol: XTZ_TOKEN_SYMBOL,
        type: USER_TOKEN_TYPE_DEFAULT,
      },
    }
    // ----- GETTING USER'S TOKENS BALANCES, THAT ARE USED ACROSS DAPP *END* -----

    // ----- GETTING USER'S REWARDS *START* -----
    userInfo.availableDoormanRewards = calcUsersDoormanRewards({
      mySMvkTokenBalance: userInfo.userTokens[SMVK_TOKEN_SYMBOL].balance ?? 0,
      userDoormanRewardsFromGQL: userRewardsData?.doorman?.[0],
    })
    userInfo.availableSatellitesRewards = calcUsersSatelliteRewards({
      mySMvkTokenBalance: userInfo.userTokens[SMVK_TOKEN_SYMBOL].balance ?? 0,
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
      normalizedMTokens.reduce((acc, { rewards_earned, tokenSymbol }) => {
        acc += rewards_earned

        return acc
      }, 0) ?? 0

    const { actionsHistory, gatheredDoormanRewards, gatheredFarmRewards, gatheredSatellitesRewards } =
      calcUsersRewardsToDate(stakes_history_data)

    userInfo.gatheredDoormanRewards = gatheredDoormanRewards
    userInfo.gatheredFarmRewards = gatheredFarmRewards
    userInfo.gatheredSatellitesRewards = gatheredSatellitesRewards
    userInfo.actionsHistory = actionsHistory
    // ----- GETTING USER'S REWARDS *END* -----

    // ----- GETTING USER'S LOANS HISTORY DATA *START* -----
    const userLendingData = await fetchFromIndexer(
      USER_LENDING_DATA_QUERY,
      USER_LENDING_DATA_QUERY_NAME,
      USER_LENDING_DATA_QUERY_VARIABLE(accountPkh),
    )

    const { userBorrowing, userLendings, userVaultsData } = normalizeUserLending({
      dipDupTokens,
      feeds,
      userDataLoansHistoryGql: userLendingData.mavryk_user?.[0]?.lending_controller_history_data_sender,
      userVaultsDataGql: userLendingData.mavryk_user?.[0]?.lending_controller_vaults,
    })

    userInfo.userLoansData = {
      userBorrowing,
      userLendings,
      userVaultsData,
    }
    // ----- GETTING USER'S LOANS HISTORY DATA *END* -----

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
    tokens: { dipDupTokens, avaliableCollaterals, whitelistTokens },
    dataFeeds: { feedsLedger },
  } = getState()

  const userAddressToLoadData = newAccAddress ?? accountPkh

  try {
    if (userAddressToLoadData) {
      const userData = await fetchUserData(
        userAddressToLoadData,
        dipDupTokens,
        feedsLedger,
        avaliableCollaterals,
        whitelistTokens,
        level,
      )

      dispatch({
        type: UPDATE_USER_DATA,
        userData: userData,
        accountPkh: userAddressToLoadData,
      })

      await dispatch(getAvaliableCollaterals())
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}
