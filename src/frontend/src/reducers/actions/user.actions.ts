import { Doorman, Satellite_Rewards } from './../../utils/generated/graphqlTypes'
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
} from 'gql/queries'
import {
  USER_LENDING_DATA_QUERY,
  USER_LENDING_DATA_QUERY_NAME,
  USER_LENDING_DATA_QUERY_VARIABLE,
} from 'gql/queries/getLoansStorage'
import { getAssetMetadata, normalizeUserLending } from 'pages/Loans/Loans.helpers'
import { State } from 'reducers'
import { UserState, DEFAULT_USER } from 'reducers/wallet'
import {
  calcWithoutPrecision,
  calcWithoutMu,
  calcUsersRewardsToDate,
  calcUsersDoormanRewards,
  calcUsersSatelliteRewards,
  calcUsersFarmRewards,
  convertFromIndexerToRegNum,
} from 'utils/calcFunctions'
import { Farm, Lending_Controller_Loan_Token } from 'utils/generated/graphqlTypes'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

const checkWhetherUserIsActiveSatelltie = (satellitesList: Array<SatelliteRecord>, userAddress: string) =>
  Boolean(
    satellitesList.find(
      ({ address: satelliteAddress, status, currentlyRegistered }) =>
        satelliteAddress === userAddress && status === 0 && currentlyRegistered,
    ),
  )

const TZBTC_CONTRACT_ADDRESS = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn'
const getXtzAndTzbtcUserBalance = async (accountPkh: string) => {
  const [xtzBalance, tzBTC] = await Promise.all([
    await (
      await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${accountPkh}/balance`)
    ).json(),
    await (
      await fetch(
        `https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}&token.contract.in=${TZBTC_CONTRACT_ADDRESS}`,
      )
    ).json(),
  ])

  const { balance: tzbtcBalance = 0, token: { metadata: { decimals: tzbtcDecimalsAmount = 0 } = {} } = {} } = tzBTC
  return {
    xtzBalance: calcWithoutMu(Number(xtzBalance)),
    tzbtcBalance: convertFromIndexerToRegNum(tzbtcBalance, tzbtcDecimalsAmount),
  }
}

export const fetchUserData = async (
  accountPkh: string,
  activeSatellites: Array<SatelliteRecord>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['oracles']['oraclesStorage']['feeds'],
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

    const { xtzBalance, tzbtcBalance } = await getXtzAndTzbtcUserBalance(accountPkh)

    const {
      mvk_balance = 0,
      smvk_balance = 0,
      m_token_accounts,
      delegations,
      stakes_history_data,
    } = userInfoFromIndexer?.mavryk_user[0] ?? {}

    const userInfo: Partial<UserState> = {
      myMvkTokenBalance: calcWithoutPrecision(mvk_balance),
      mySMvkTokenBalance: calcWithoutPrecision(smvk_balance),
      myXTZTokenBalance: xtzBalance,
      mytzBTCTokenBalance: tzbtcBalance,
      mTokens: m_token_accounts,
      satelliteMvkIsDelegatedTo: delegations?.[0]?.satellite?.user?.address ?? '',
      isSatellite: checkWhetherUserIsActiveSatelltie(activeSatellites, accountPkh),
    }

    // getting user rewards
    userInfo.myDoormanRewardsData = calcUsersDoormanRewards({
      mySMvkTokenBalance: userInfo.mySMvkTokenBalance ?? 0,
      userDoormanRewardsFromGQL: userRewardsData.doorman[0] as Doorman,
    })
    userInfo.mySatelliteRewardsData = calcUsersSatelliteRewards({
      mySMvkTokenBalance: userInfo.mySMvkTokenBalance ?? 0,
      userSatelliteRewardsFromGQL: userRewardsData.satellite_rewards[0] as Satellite_Rewards,
    })
    userInfo.myFarmRewardsData = calcUsersFarmRewards({
      currentBlockLevel: currentBlockLevel,
      userFarmsRewardsFromGQL: userRewardsData.farm as Array<Farm>,
    })

    const loanTokens = userRewardsData.lending_controller[0].loan_tokens as Array<Lending_Controller_Loan_Token>
    const interestRateDecimals = userRewardsData.lending_controller[0]?.interest_rate_decimals ?? 0

    /**
     * @description userInfo.mTokens.reduce
     * getting how much user has earned by loans,
     * we are receiving large number that we need to conver to people readable format
     * to convert it we need to get decimals for loan asset we are getting rewards of,
     * and general decimal places for loans in general, and if we have all decimals we can calc correct number, the formula is:
     * (reward amount in blockchain number) / (10 ** decimals for loanasset + decimals for loans in general) * (rate of the loan asset to convert it all to $)
     */
    userInfo.myLendingRewardsAmount =
      userInfo.mTokens?.reduce((acc, { rewards_earned, m_token: { loan_token_name: mTokenName, address } }) => {
        const { oracle_id } = loanTokens.find(({ loan_token_name }) => loan_token_name === mTokenName) ?? {}

        if (!oracle_id) return acc

        const loanTokenMetadata = getAssetMetadata({
          tokenName: mTokenName,
          tokenAddress: address,
          dipDupTokens,
          feeds,
          oracleId: String(oracle_id),
        })

        if (loanTokenMetadata) {
          acc +=
            convertFromIndexerToRegNum(rewards_earned, interestRateDecimals + loanTokenMetadata.decimals) *
            loanTokenMetadata.rate
        }

        return acc
      }, 0) ?? 0

    const { actionsHistory, ...userRewardsToDate } = calcUsersRewardsToDate(stakes_history_data)

    userInfo.userRewardsToDate = userRewardsToDate
    userInfo.actionsHistory = actionsHistory

    // getting user lend/borrow history data
    const userLendingData = await fetchFromIndexer(
      USER_LENDING_DATA_QUERY,
      USER_LENDING_DATA_QUERY_NAME,
      USER_LENDING_DATA_QUERY_VARIABLE(accountPkh),
    )

    const { userBorrowing, userLendings } = normalizeUserLending({
      dipDupTokens,
      feeds,
      userDataFromIndexer: userLendingData.mavryk_user?.[0]?.lending_controller_history_data_sender,
    })

    userInfo.userLoansData = {
      userBorrowing,
      userLendings,
    }

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
export const updateUserData = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    preferences: { headData: { level = 0 } = {} },
    delegation: {
      delegationStorage: { activeSatellites },
    },
    wallet: { accountPkh },
    tokens: { dipDupTokens },
    oracles: {
      oraclesStorage: { feeds },
    },
  } = getState()

  try {
    if (accountPkh) {
      const userData = await fetchUserData(accountPkh, activeSatellites, dipDupTokens, feeds, level)

      dispatch({
        type: UPDATE_USER_DATA,
        userData: userData,
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}
