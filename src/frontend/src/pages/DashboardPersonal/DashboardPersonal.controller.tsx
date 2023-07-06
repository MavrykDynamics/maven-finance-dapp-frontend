import { useParams } from 'react-router'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

import { State } from 'reducers'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { claimAllRewardsAction } from './DashboardPersonal.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import {
  isValidPersonalDashboardTabId,
  PORTFOLIO_TAB_ID,
  DELEGATION_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
} from './DashboardPersonal.utils'
import { BUTTON_NAVIGATION } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles/components'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'

import { DashboardPersonalTabStyled } from './DashboardPersonalComponents/DashboardPersonalComponents.style'
import { getVestingStorage } from 'pages/Treasury/Treasury.actions'
import VestingTab from './DashboardPersonalComponents/VestingTab'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useStakeContext } from 'providers/StakeProvider/stake.provider'
import {
  MVK_BALANCE_SUB,
  MVK_TOTAL_SUB,
  DEFAULT_STAKING_ACTIVE_SUBS,
} from 'providers/StakeProvider/helpers/stake.consts'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const { tokensPrices, tokensMetadata, mTokens } = useTokensContext()
  const {
    contractAddresses: { mvkTokenAddress },
  } = useDappConfigContext()
  const {
    userTokensBalances,
    userAddress,
    userAvatars: { mainAvatar },
    availableDoormanRewards,
    availableSatellitesRewards,
    availableFarmRewards,
    availableLoansRewards,
    gatheredDoormanRewards,
    gatheredFarmRewards,
    gatheredSatellitesRewards,
    isSatellite,
    isVestee,
  } = useUserContext()
  const { changeSatellitesSubscriptionsList, isLoading: isSatellitesLoading } = useSatellitesContext()

  const { changeStakingSubscriptionsList, isLoading: isDoormanLoading } = useStakeContext()

  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { isDataLoaded: isLoansLoaded } = useSelector((state: State) => state.loans)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)

  const claimRewards = async () => await dispatch(claimAllRewardsAction(tokensMetadata))

  useEffect(() => {
    changeStakingSubscriptionsList({
      [MVK_TOTAL_SUB]: true,
      [MVK_BALANCE_SUB]: true,
    })

    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: true,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        await Promise.all(
          [
            (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
            (!isEgovLoaded || isDepsChanged) && dispatch(getEmergencyGovernanceStorage()),
            isVestee && (!isVestingLoaded || isDepsChanged) && dispatch(getVestingStorage()),
            (!isLoansLoaded || isDepsChanged) && dispatch(getLoansStorage()),
          ].filter(Boolean),
        )
      } catch (e) {}
    },
    [userAddress],
  )

  const rewards = {
    rewardsToClaim:
      availableDoormanRewards +
      availableSatellitesRewards +
      Object.values(availableFarmRewards).reduce((acc, farmReward) => (acc += farmReward), 0),
    earnedRewards: gatheredSatellitesRewards + gatheredFarmRewards + gatheredDoormanRewards,
  }

  const earnings = {
    satelliteRewards: gatheredSatellitesRewards,
    farmsRewards: gatheredFarmRewards,
    exitRewards: gatheredDoormanRewards,
    lendingIncome: availableLoansRewards,
  }

  const mostSuppliedUserToken = (userTokensBalances ? Object.keys(userTokensBalances) : []).reduce<null | {
    address: string
    symbol: string
    balance: number
  }>((acc, tokenAddress) => {
    // If token is mToken or shown by default return acc, we skip such tokens
    if (
      tokenAddress === mvkTokenAddress ||
      tokenAddress === SMVK_TOKEN_ADDRESS ||
      tokenAddress === XTZ_TOKEN_ADDRESS ||
      mTokens.includes(tokenAddress)
    )
      return acc

    const tokenToCheck = getTokenDataByAddress({ tokensMetadata, tokenAddress, tokensPrices })
    const tokenToCheckBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress })

    // If token to compare is not valid skip check
    if (!tokenToCheck || !tokenToCheck.rate) return acc

    // if we don't have acc, make acc current token, cuz it's valid
    if (!acc)
      return {
        address: tokenAddress,
        balance: tokenToCheckBalance,
        symbol: tokenToCheck.symbol,
      }

    const accToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: acc.address, tokensPrices })

    // check for acc token exist to make ts satisfied, cuz it's 100% valid token inside acc
    if (!accToken || !accToken.rate) return acc

    const { rate: checkTokenRate } = tokenToCheck
    const { rate: accTokenRate } = accToken
    const accTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: acc.address })

    return accTokenBalance * accTokenRate > tokenToCheckBalance * checkTokenRate
      ? acc
      : {
          address: tokenToCheck.address,
          balance: tokenToCheckBalance,
          symbol: tokenToCheck.symbol,
        }
  }, null)

  const walletData = {
    xtzAmount: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: XTZ_TOKEN_ADDRESS }),
    sMVKAmount: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }),
    MVKAmount: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress }),
    ...(mostSuppliedUserToken
      ? {
          mostSuppliedUserToken: {
            name: mostSuppliedUserToken.symbol,
            amount: mostSuppliedUserToken.balance,
          },
        }
      : {}),
  }

  const activeTab = useMemo(() => (isValidPersonalDashboardTabId(tabId) ? tabId : PORTFOLIO_TAB_ID), [tabId])

  return (
    <Page>
      <PageHeader page={'dashboard'} avatar={mainAvatar} />

      <DashboardPersonalStyled>
        <div className="top">
          <DashboardPersonalMyRewards {...rewards} claimRewardsHandler={claimRewards} />
          <DashboardPersonalEarningsHistory {...earnings} />
        </div>

        {isLoading || isDoormanLoading || isSatellitesLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading your statistic</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="tabs-switchers">
              <Link to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}>
                <Button selected={activeTab === PORTFOLIO_TAB_ID} kind={BUTTON_NAVIGATION}>
                  Portfolio
                </Button>
              </Link>
              <Link to={`/dashboard-personal/${isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID}`}>
                <Button
                  selected={activeTab === (isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID)}
                  kind={BUTTON_NAVIGATION}
                >
                  {isSatellite ? 'Satellite' : 'Delegation'}
                </Button>
              </Link>
              {isVestee ? (
                <Link to={`/dashboard-personal/${VESTING_TAB_ID}`}>
                  <Button selected={activeTab === VESTING_TAB_ID} kind={BUTTON_NAVIGATION}>
                    Vesting
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className={`bottom-grid ${activeTab}`}>
              <DashboardPersonalTabStyled>
                <Switch>
                  <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/:secondaryTabId?`}>
                    <PortfolioTab {...walletData} isUserLoansLoading={isLoading} />
                  </Route>
                  <Route exact path={`/dashboard-personal/${DELEGATION_TAB_ID}`}>
                    <DelegationTab />
                  </Route>
                  <Route exact path={`/dashboard-personal/${SATELLITE_TAB_ID}`}>
                    <SatelliteTab />
                  </Route>
                  <Route exact path={`/dashboard-personal/${VESTING_TAB_ID}`}>
                    <VestingTab />
                  </Route>

                  <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />
                </Switch>
              </DashboardPersonalTabStyled>
            </div>
          </>
        )}
      </DashboardPersonalStyled>
    </Page>
  )
}

export default DashboardPersonal
