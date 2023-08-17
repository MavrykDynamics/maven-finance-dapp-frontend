import { useCallback, useEffect, useMemo } from 'react'
import { useHistory, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

// types
import { State } from 'reducers'

// components
import Button from 'app/App.components/Button/NewButton'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'
import VestingTab from './DashboardPersonalComponents/VestingTab'

// styles
import { Page } from 'styles/components'
import { DashboardPersonalTabStyled } from './DashboardPersonalComponents/DashboardPersonalComponents.style'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// helpers
import {
  isValidPersonalDashboardTabId,
  PORTFOLIO_TAB_ID,
  DELEGATION_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
} from './DashboardPersonal.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// actions
import { claimAllRewardsAction, distributeProposalRewards } from 'providers/UserProvider/actions/user.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { getVestingStorage } from 'pages/Treasury/Treasury.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// consts
import { BUTTON_NAVIGATION } from 'app/App.components/Button/Button.constants'
import { SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'
import { CLAIM_ALL_REWARDS_ACTION } from 'providers/UserProvider/helpers/user.consts'
import { DAPP_MVK_SMVK_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from 'providers/DoormanProvider/helpers/doorman.consts'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
  SATELLITES_DATA_SINGLE_SUB,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
} from 'providers/SatellitesProvider/satellites.const'

// hooks
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()
  const history = useHistory()

  const { tokensPrices, tokensMetadata, mTokens } = useTokensContext()
  const {
    contractAddresses: { mvkTokenAddress, doormanAddress, delegationAddress },
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
  const { changeSatellitesSubscriptionsList } = useSatellitesContext()
  const { bug } = useToasterContext()
  const { changeStakingSubscriptionsList, isLoading: isDoormanLoading } = useDoormanContext()

  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVK_SMVK_STATS_SUB]: true,
    })
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_SINGLE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  useEffect(() => {
    history.replace(`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`)
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

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        await Promise.all(
          [
            (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
            (!isEgovLoaded || isDepsChanged) && dispatch(getEmergencyGovernanceStorage()),
            isVestee && (!isVestingLoaded || isDepsChanged) && dispatch(getVestingStorage()),
          ].filter(Boolean),
        )
      } catch (e) {}
    },
    [userAddress],
  )

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

    if (!delegationAddress) {
      bug('Wrong delegation address')
      return null
    }

    const satelliteAddressToDistribute = isSatellite ? userAddress : satelliteMvkIsDelegatedTo

    if (!satelliteAddressToDistribute) {
      bug('Wrong satellite address to distribute rewards')
      return null
    }

    return await distributeProposalRewards(delegationAddress, satelliteAddressToDistribute, availableProposalRewards)
  }, [userAddress, delegationAddress, isSatellite, satelliteMvkIsDelegatedTo, availableProposalRewards, bug])

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

        {isLoading || isDoormanLoading ? (
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
              <Link
                to={userAddress ? `/dashboard-personal/${isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID}` : '#'}
              >
                <Button
                  selected={activeTab === (isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID)}
                  kind={BUTTON_NAVIGATION}
                  disabled={!userAddress}
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
                    <DelegationTab distributeProposalRewards={distributeRewardsCallback} />
                  </Route>
                  <Route exact path={`/dashboard-personal/${SATELLITE_TAB_ID}`}>
                    <SatelliteTab distributeProposalRewards={distributeRewardsCallback} />
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
