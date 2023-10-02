import { useCallback, useEffect, useMemo } from 'react'
import { usePrevious } from 'react-use'
import { useHistory, useParams } from 'react-router'
import qs from 'qs'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

// components
import Button from 'app/App.components/Button/NewButton'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import VestingTab from './DashboardPersonalComponents/VestingTab'
import { Page } from 'styles/components'
import { DashboardPersonalTabStyled } from './DashboardPersonalComponents/DashboardPersonalComponents.style'
import { DashboardPersonalStyled } from './DashboardPersonal.style'

// helpers
import {
  isValidPersonalDashboardTabId,
  PORTFOLIO_TAB_ID,
  DELEGATION_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
  getDbPersonalUserWalletData,
} from './DashboardPersonal.utils'

// actions
import { claimAllRewardsAction, distributeProposalRewards } from 'providers/UserProvider/actions/user.actions'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// consts
import { BUTTON_NAVIGATION } from 'app/App.components/Button/Button.constants'
import { CLAIM_ALL_REWARDS_ACTION } from 'providers/UserProvider/helpers/user.consts'
import { USER_ACTIONS_HISTORY } from 'app/App.components/Pagination/pagination.consts'
import { DISTRIBUTE_PROPOSALS_REWARDS_ACTION } from 'providers/SatellitesProvider/satellites.const'

const DashboardPersonal = () => {
  const { tabId } = useParams<{ tabId: string }>()
  const history = useHistory()

  const { bug } = useToasterContext()
  const { tokensPrices, tokensMetadata, mTokens } = useTokensContext()
  const {
    contractAddresses: { mvkTokenAddress, doormanAddress, governanceAddress },
  } = useDappConfigContext()
  const {
    userTokensBalances,
    userAddress,
    userAvatars: { mainAvatar },
    satelliteMvkIsDelegatedTo,
    availableLoansRewards,
    isSatellite,
    isVestee,
  } = useUserContext()

  const prevUserAddress = usePrevious(userAddress)

  // if we change user, redirect him to main screen on dashboard, as he might not have permission to some screens
  useEffect(() => {
    if (prevUserAddress && prevUserAddress !== userAddress) {
      history.replace(`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`)
    }
  }, [userAddress])

  const {
    isLoading: isRewardsLoading,
    availableDoormanRewards,
    availableSatellitesRewards,
    availableFarmRewards,
    availableProposalRewards,
    gatheredDoormanRewards,
    gatheredFarmRewards,
    gatheredSatellitesRewards,
  } = useUserRewards()

  // claim rewards action
  const claimRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!doormanAddress) {
      bug('Wrong doorman address')
      return null
    }

    return await claimAllRewardsAction(
      userAddress,
      doormanAddress,
      availableDoormanRewards,
      availableSatellitesRewards,
      availableFarmRewards,
    )
  }, [availableDoormanRewards, availableFarmRewards, availableSatellitesRewards, bug, doormanAddress, userAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CLAIM_ALL_REWARDS_ACTION,
      actionFn: claimRewardsAction,
    }),
    [claimRewardsAction],
  )

  const { action: claimRewards } = useContractAction(contractActionProps)

  // distributeRewards action
  const distributeRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!governanceAddress) {
      bug('Wrong governance address')
      return null
    }

    const satelliteAddressToDistribute = isSatellite ? userAddress : satelliteMvkIsDelegatedTo

    if (!satelliteAddressToDistribute) {
      bug('Wrong satellite address to distribute rewards')
      return null
    }

    return await distributeProposalRewards(governanceAddress, satelliteAddressToDistribute, availableProposalRewards)
  }, [userAddress, governanceAddress, isSatellite, satelliteMvkIsDelegatedTo, availableProposalRewards, bug])

  const distributeRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
      actionFn: distributeRewardsAction,
    }),
    [distributeRewardsAction],
  )

  const { action: distributeRewardsCallback } = useContractAction(distributeRewardsContractActionProps)

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

  const userWalletData = useMemo(
    () => getDbPersonalUserWalletData({ userTokensBalances, mTokens, mvkTokenAddress, tokensPrices, tokensMetadata }),
    [userTokensBalances, mTokens, mvkTokenAddress, tokensPrices, tokensMetadata],
  )
  const activeTab = useMemo(() => (isValidPersonalDashboardTabId(tabId) ? tabId : PORTFOLIO_TAB_ID), [tabId])

  return (
    <Page>
      <PageHeader page={'dashboard'} avatar={mainAvatar} />

      <DashboardPersonalStyled>
        {isRewardsLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading your rewards data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="top">
              <DashboardPersonalMyRewards {...rewards} claimRewardsHandler={claimRewards} />
              <DashboardPersonalEarningsHistory {...earnings} />
            </div>

            <div className="tabs-switchers">
              <Link to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}>
                <Button selected={activeTab === PORTFOLIO_TAB_ID} kind={BUTTON_NAVIGATION}>
                  Portfolio
                </Button>
              </Link>
              {userAddress ? (
                <Link
                  to={
                    userAddress
                      ? `/dashboard-personal/${isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID}${qs.stringify(
                          { page: { [USER_ACTIONS_HISTORY]: 1 } },
                          { addQueryPrefix: true },
                        )}`
                      : '#'
                  }
                >
                  <Button
                    selected={activeTab === (isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID)}
                    kind={BUTTON_NAVIGATION}
                    disabled={!userAddress}
                  >
                    {isSatellite ? 'Satellite' : 'Delegation'}
                  </Button>
                </Link>
              ) : null}
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
                  <Route exact path={`/dashboard-personal/${DELEGATION_TAB_ID}`}>
                    <DelegationTab
                      distributeProposalRewards={distributeRewardsCallback}
                      availableProposalRewards={availableProposalRewards}
                    />
                  </Route>
                  <Route exact path={`/dashboard-personal/${SATELLITE_TAB_ID}`}>
                    <SatelliteTab
                      distributeProposalRewards={distributeRewardsCallback}
                      availableProposalRewards={availableProposalRewards}
                    />
                  </Route>
                  <Route exact path={`/dashboard-personal/${VESTING_TAB_ID}`}>
                    <VestingTab />
                  </Route>
                  <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/:secondaryTabId?`}>
                    <PortfolioTab {...userWalletData} />
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
