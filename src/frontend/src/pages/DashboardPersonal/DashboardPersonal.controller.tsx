import { useParams } from 'react-router'
import { useMemo } from 'react'
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
import { getUserAvatar } from 'app/App.components/Avatar/Avatar.helpers'

import { DashboardPersonalTabStyled } from './DashboardPersonalComponents/DashboardPersonalComponents.style'
import { getVestingStorage } from 'pages/Treasury/Treasury.actions'
import VestingTab from './DashboardPersonalComponents/VestingTab'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { DOORMAN_STATS_SUB, useStakeUpdater } from 'providers/StakeProvider/hooks/useStakeUpdater'
import { updateUserData } from 'reducers/actions/user.actions'
import { MVK_TOKEN_SYMBOL, XTZ_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const { tokensPrices } = useSelector((state: State) => state.tokens)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const { councilMembers, breakGlassCouncilMembers } = useSelector((state: State) => state.council)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { isDataLoaded: isLoansLoaded } = useSelector((state: State) => state.loans)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)
  const {
    accountPkh,
    user: {
      userTokens,
      availableDoormanRewards,
      availableSatellitesRewards,
      availableFarmRewards,
      availableLoansRewards,
      gatheredDoormanRewards,
      gatheredFarmRewards,
      gatheredSatellitesRewards,
      isSatellite,
      isVestee,
      isLoaded: isUserDataLoaded,
    },
  } = useSelector((state: State) => state.wallet)

  const claimRewards = async () => await dispatch(claimAllRewardsAction())

  const { isLoading: isDoormanLoading } = useStakeUpdater(false, [DOORMAN_STATS_SUB])

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        await Promise.all(
          [
            (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
            (!isEgovLoaded || isDepsChanged) && dispatch(getEmergencyGovernanceStorage()),
            isVestee && (!isVestingLoaded || isDepsChanged) && dispatch(getVestingStorage()),
            (!isLoansLoaded || isDepsChanged) && dispatch(getLoansStorage()),
            (!isUserDataLoaded || isDepsChanged) && dispatch(updateUserData()),
          ].filter(Boolean),
        )
      } catch (e) {}
    },
    [accountPkh],
  )

  const rewards = {
    rewardsToClaim:
      availableDoormanRewards +
      availableSatellitesRewards +
      Object.values(availableFarmRewards).reduce(
        (acc, { myAvailableFarmRewards }) => (acc += myAvailableFarmRewards),
        0,
      ),
    earnedRewards: gatheredSatellitesRewards + gatheredFarmRewards + gatheredDoormanRewards,
  }

  const earnings = {
    mvkRate: tokensPrices[MVK_TOKEN_SYMBOL],
    xtzRate: tokensPrices[XTZ_TOKEN_SYMBOL],
    satelliteRewards: gatheredSatellitesRewards,
    farmsRewards: gatheredFarmRewards,
    exitRewards: gatheredDoormanRewards,
    lendingIncome: availableLoansRewards,
  }

  const userTokensList = Object.values(userTokens)
  const mostSuppliedUserTokenSymbol = userTokensList.reduce((acc, { symbol, balance }) => {
    if (symbol === MVK_TOKEN_SYMBOL || symbol === SMVK_TOKEN_SYMBOL || symbol === XTZ_TOKEN_SYMBOL) return acc
    const accAssetBalanceInUSD = Number(userTokens[acc]?.balance ?? 0) * (tokensPrices[acc] ?? 1)
    const assetToCompareBalanceInUSD = Number(balance) * (tokensPrices[symbol] ?? 1)
    return accAssetBalanceInUSD > assetToCompareBalanceInUSD ? acc : symbol
  }, '')

  const walletData = {
    xtzAmount: userTokens[XTZ_TOKEN_SYMBOL].balance,
    sMVKAmount: userTokens[SMVK_TOKEN_SYMBOL].balance,
    MVKAmount: userTokens[MVK_TOKEN_SYMBOL].balance,
    ...(mostSuppliedUserTokenSymbol
      ? {
          mostSuppliedUserToken: {
            name: userTokens[mostSuppliedUserTokenSymbol].name,
            amount: userTokens[mostSuppliedUserTokenSymbol].balance,
          },
        }
      : {}),
  }

  const activeTab = useMemo(() => (isValidPersonalDashboardTabId(tabId) ? tabId : PORTFOLIO_TAB_ID), [tabId])

  const userImage = useMemo(
    () =>
      getUserAvatar({
        accountPkh,
        satelliteMapper,
        councilMembers,
        breakGlassCouncilMembers,
      }),
    [accountPkh, breakGlassCouncilMembers, councilMembers, satelliteMapper],
  )

  return (
    <Page>
      <PageHeader page={'dashboard'} avatar={userImage} />

      <DashboardPersonalStyled>
        <div className="top">
          <DashboardPersonalMyRewards {...rewards} claimRewardsHandler={claimRewards} />
          <DashboardPersonalEarningsHistory {...earnings} />
        </div>

        {isLoading ? (
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
