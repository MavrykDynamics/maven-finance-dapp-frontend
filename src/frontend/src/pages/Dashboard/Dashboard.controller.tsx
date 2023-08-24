import { useEffect, useMemo } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router'

import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

// providers
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// const & types
import {
  mvkStatsType,
  isValidPersonalDashboardTabId,
  LENDING_TAB_ID,
  FARMS_TAB_ID,
  ORACLES_TAB_ID,
  SATELLITES_TAB_ID,
  STAKING_TAB_ID,
  TREASURY_TAB_ID,
  VAULTS_TAB_ID,
} from './Dashboard.utils'
import { MVK_TOKEN_SYMBOL } from 'utils/constants'
import { DEFAULT_STAKING_ACTIVE_SUBS, DAPP_MVK_SMVK_STATS_SUB } from 'providers/DoormanProvider/helpers/doorman.consts'

// hooks

// utils
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Impact } from 'app/App.components/Impact/Impact'
import { Link } from 'react-router-dom'
import { DashboardStyled, BGPrimaryTitleStyled, StatBlock } from './Dashboard.style'
import { FarmsTab } from './TabScreens/FarmsTab.controller'
import { LendingTab } from './TabScreens/LendingTab.controller'
import { OraclesTab } from './TabScreens/OraclesTab.controller'
import { SatellitesTab } from './TabScreens/SatellitesTab.controller'
import { StakingTab } from './TabScreens/StakingTab.controller'
import { TreasuryTab } from './TabScreens/TreasuryTab.controller'
import { VaultsTab } from './TabScreens/VaultsTab.controller'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { useDappTvl } from 'providers/DappConfigProvider/hooks/useDappTvl'

// TODO: add farms when their data loading will be fixed and up
export const Dashboard = () => {
  const { tabId } = useParams<{ tabId: string }>()

  const activeTab = useMemo(() => (isValidPersonalDashboardTabId(tabId) ? tabId : LENDING_TAB_ID), [tabId])

  const { changeStakingSubscriptionsList, isLoading: isStakingLoading } = useDoormanContext()
  const { DAPP_TVL, isLoading: isTvlValueLoading } = useDappTvl()

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVK_SMVK_STATS_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
    }
  }, [])

  return (
    <Page>
      <PageHeader page={'dashboard'} />

      <DashboardStyled>
        {/* TODO: use staking stats loading also */}
        {/* {isTvlValueLoading || isStakingLoading ? ( */}
        {isTvlValueLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading DAPP dashboard data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="top">
              <div className="tvlBlock">
                <BGPrimaryTitleStyled>Mavryk TVL</BGPrimaryTitleStyled>
                <CommaNumber beginningText="$" value={DAPP_TVL} />
              </div>

              <DashboardMvkData />
            </div>

            <div className="dashboard-navigation">
              <Link to={`/${LENDING_TAB_ID}`} className={activeTab === LENDING_TAB_ID ? 'selected' : ''}>
                Earn/Borrow
              </Link>
              <Link to={`/${VAULTS_TAB_ID}`} className={activeTab === VAULTS_TAB_ID ? 'selected' : ''}>
                Vaults
              </Link>
              <Link to={`/${STAKING_TAB_ID}`} className={activeTab === STAKING_TAB_ID ? 'selected' : ''}>
                Staking
              </Link>
              <Link to={`/${SATELLITES_TAB_ID}`} className={activeTab === SATELLITES_TAB_ID ? 'selected' : ''}>
                Satellites
              </Link>
              <Link to={`/${TREASURY_TAB_ID}`} className={activeTab === TREASURY_TAB_ID ? 'selected' : ''}>
                Treasury
              </Link>
              <Link to={`/${FARMS_TAB_ID}`} className={activeTab === FARMS_TAB_ID ? 'selected' : ''}>
                Farms
              </Link>
              <Link to={`/${ORACLES_TAB_ID}`} className={activeTab === ORACLES_TAB_ID ? 'selected' : ''}>
                Oracles
              </Link>
            </div>

            <Switch>
              <Route exact path={`/${VAULTS_TAB_ID}`}>
                <VaultsTab />
              </Route>

              <Route exact path={`/${STAKING_TAB_ID}`}>
                <StakingTab />
              </Route>

              <Route exact path={`/${SATELLITES_TAB_ID}`}>
                <SatellitesTab />
              </Route>

              <Route exact path={`/${TREASURY_TAB_ID}`}>
                <TreasuryTab />
              </Route>

              <Route exact path={`/${FARMS_TAB_ID}`}>
                <FarmsTab />
              </Route>

              <Route exact path={`/${ORACLES_TAB_ID}`}>
                <OraclesTab />
              </Route>

              <Route exact path={`/${LENDING_TAB_ID}`}>
                <LendingTab />
              </Route>

              <Redirect to={`/${LENDING_TAB_ID}`} />
            </Switch>
          </>
        )}
      </DashboardStyled>
    </Page>
  )
}

const DashboardMvkData = () => {
  const { tokensPrices } = useTokensContext()
  const { totalStakedMvk, totalSupply, maximumTotalSupply, isLoading: isStakingLoading } = useDoormanContext()

  const mvkExchangeRate = tokensPrices[MVK_TOKEN_SYMBOL] ?? 0
  const mvkStatsBlock: mvkStatsType = {
    marketCap: mvkExchangeRate * totalSupply,
    stakedMvk: totalStakedMvk,
    circuatingSupply: totalSupply,
    maxSupply: maximumTotalSupply,
    livePrice: mvkExchangeRate,
    // TODO: remove when mvk rate will be dynamic
    prevPrice: mvkExchangeRate - 0.00999,
  }

  const mvkRateChange = calcDiffBetweenTwoNumbersInPersentage(mvkStatsBlock.livePrice, mvkStatsBlock.prevPrice)

  return (
    <div className="mvkStats">
      {isStakingLoading ? (
        <DataLoaderWrapper margin="25px 0px 25px -15px">
          <ClockLoader width={75} height={75} />
          <div className="text">Loading MVK token data</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <BGPrimaryTitleStyled>MVK</BGPrimaryTitleStyled>
          <div className="statsWrapper">
            <StatBlock>
              <div className="name">Market Cap</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.marketCap} endingText="USD" />
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Staked MVK</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.stakedMvk} endingText="MVK" />
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Live Price</div>
              <div className="value">
                <CommaNumber beginningText="$" value={mvkStatsBlock.livePrice} />
                <div className="impact-wrapper">
                  <Impact value={mvkRateChange} endingText="% 24h" />
                </div>
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Circulating Supply</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.circuatingSupply} endingText="MVK" />
              </div>
            </StatBlock>

            <StatBlock>
              <div className="name">Max Supply</div>
              <div className="value">
                <CommaNumber value={mvkStatsBlock.maxSupply} endingText="MVK" />
              </div>
            </StatBlock>
          </div>
        </>
      )}
    </div>
  )
}
