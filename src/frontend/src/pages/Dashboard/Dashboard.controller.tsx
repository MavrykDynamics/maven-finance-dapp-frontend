import { useEffect, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router'
import QueryString from 'qs'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'
import { SatellitesTab } from './TabScreens/SatellitesTab.controller'
import { BGPrimaryTitleStyled, DashboardStyled, StatBlock } from './Dashboard.style'
import { FarmsTab } from './TabScreens/FarmsTab.controller'
import { LendingTab } from './TabScreens/LendingTab.controller'
import { OraclesTab } from './TabScreens/OraclesTab.controller'
import { StakingTab } from './TabScreens/StakingTab.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TreasuryTab } from './TabScreens/TreasuryTab.controller'
import { VaultsTab } from './TabScreens/VaultsTab.controller'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Impact } from 'app/App.components/Impact/Impact'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// const
import {
  FARMS_TAB_ID,
  isValidPersonalDashboardTabId,
  LENDING_TAB_ID,
  mvnStatsType,
  ORACLES_TAB_ID,
  SATELLITES_TAB_ID,
  STAKING_TAB_ID,
  TabId,
  TREASURY_TAB_ID,
  VAULTS_TAB_ID,
} from './Dashboard.utils'
import { MVN_TOKEN_SYMBOL } from 'utils/constants'
import { DAPP_MVN_SMVN_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from 'providers/DoormanProvider/helpers/doorman.consts'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useDappTvl } from 'providers/DappConfigProvider/hooks/useDappTvl'

// utils
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'
import CustomLink from 'app/App.components/CustomLink/CustomLink'

const isGovApp = __APP_MODE__ === 'gov'
const DEFAULT_TAB = isGovApp ? STAKING_TAB_ID : LENDING_TAB_ID

// Each app excludes tabs that depend on providers not in its provider tree
const isValidTabForAppMode = (tab: string): tab is TabId => {
  if (!isValidPersonalDashboardTabId(tab)) return false
  if (isGovApp && (tab === LENDING_TAB_ID || tab === VAULTS_TAB_ID || tab === FARMS_TAB_ID)) return false
  if (!isGovApp && tab === TREASURY_TAB_ID) return false
  return true
}

// TODO: add farms when their data loading will be fixed and up
export const Dashboard = () => {
  const { search } = useLocation()

  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { tab: string }
  const activeTab = useMemo(
    () => (isValidTabForAppMode(parsedQp.tab) ? parsedQp.tab : DEFAULT_TAB),
    [parsedQp],
  )

  const { changeStakingSubscriptionsList, isLoading: isStakingLoading } = useDoormanContext()
  const { DAPP_TVL, isLoading: isTvlValueLoading } = useDappTvl()

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVN_SMVN_STATS_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
    }
  }, [])

  return (
    <Page>
      <PageHeader page={'dashboard'} />

      <DashboardStyled>
        {isTvlValueLoading || isStakingLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading DAPP dashboard data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="top">
              <div className="tvlBlock">
                <BGPrimaryTitleStyled>Maven TVL</BGPrimaryTitleStyled>
                <CommaNumber beginningText="$" value={DAPP_TVL} />
              </div>

              <DashboardMvnData />
            </div>

            <div className="dashboard-navigation">
              {!isGovApp && (
                <CustomLink
                  to={`/${LENDING_TAB_ID}`}
                  styling={{
                    navigationLink: activeTab !== LENDING_TAB_ID,
                    navigationActiveLink: activeTab === LENDING_TAB_ID,
                  }}
                >
                  Earn/Borrow
                </CustomLink>
              )}
              {!isGovApp && (
                <CustomLink
                  to={`/`}
                  queryParams={{ tab: VAULTS_TAB_ID }}
                  styling={{
                    navigationLink: activeTab !== VAULTS_TAB_ID,
                    navigationActiveLink: activeTab === VAULTS_TAB_ID,
                  }}
                >
                  Vaults
                </CustomLink>
              )}
              <CustomLink
                to={`/`}
                queryParams={{ tab: STAKING_TAB_ID }}
                styling={{
                  navigationLink: activeTab !== STAKING_TAB_ID,
                  navigationActiveLink: activeTab === STAKING_TAB_ID,
                }}
              >
                Staking
              </CustomLink>
              <CustomLink
                to={`/`}
                queryParams={{ tab: SATELLITES_TAB_ID }}
                styling={{
                  navigationLink: activeTab !== SATELLITES_TAB_ID,
                  navigationActiveLink: activeTab === SATELLITES_TAB_ID,
                }}
              >
                Satellites
              </CustomLink>
              {isGovApp && (
                <CustomLink
                  to={`/`}
                  queryParams={{ tab: TREASURY_TAB_ID }}
                  styling={{
                    navigationLink: activeTab !== TREASURY_TAB_ID,
                    navigationActiveLink: activeTab === TREASURY_TAB_ID,
                  }}
                >
                  Treasury
                </CustomLink>
              )}
              {!isGovApp && (
                <CustomLink
                  to={`/`}
                  queryParams={{ tab: FARMS_TAB_ID }}
                  styling={{
                    navigationLink: activeTab !== FARMS_TAB_ID,
                    navigationActiveLink: activeTab === FARMS_TAB_ID,
                  }}
                >
                  Farms
                </CustomLink>
              )}
              <CustomLink
                to={`/`}
                queryParams={{ tab: ORACLES_TAB_ID }}
                styling={{
                  navigationLink: activeTab !== ORACLES_TAB_ID,
                  navigationActiveLink: activeTab === ORACLES_TAB_ID,
                }}
              >
                Oracles
              </CustomLink>
            </div>

            <TabById activeTab={activeTab} />
          </>
        )}
      </DashboardStyled>
    </Page>
  )
}

const TabById = ({ activeTab }: { activeTab: TabId }) => {
  switch (activeTab) {
    case LENDING_TAB_ID:
      return isGovApp ? <Navigate to={`/?tab=${DEFAULT_TAB}`} /> : <LendingTab />
    case VAULTS_TAB_ID:
      return isGovApp ? <Navigate to={`/?tab=${DEFAULT_TAB}`} /> : <VaultsTab />
    case FARMS_TAB_ID:
      return isGovApp ? <Navigate to={`/?tab=${DEFAULT_TAB}`} /> : <FarmsTab />
    case SATELLITES_TAB_ID:
      return <SatellitesTab />
    case ORACLES_TAB_ID:
      return <OraclesTab />
    case TREASURY_TAB_ID:
      return isGovApp ? <TreasuryTab /> : <Navigate to={`/?tab=${DEFAULT_TAB}`} />
    case STAKING_TAB_ID:
      return <StakingTab />
    default:
      return <Navigate to={`/?tab=${DEFAULT_TAB}`} />
  }
}

const DashboardMvnData = () => {
  const { tokensPrices } = useTokensContext()
  // staking stats loading is handled in <Dashboard /> component
  const { totalStakedMvn, totalSupply, maximumTotalSupply } = useDoormanContext()

  const mvnExchangeRate = tokensPrices[MVN_TOKEN_SYMBOL] ?? 0
  const mvnStatsBlock: mvnStatsType = {
    marketCap: mvnExchangeRate * totalSupply,
    stakedMvn: totalStakedMvn,
    circulatingSupply: totalSupply,
    maxSupply: maximumTotalSupply,
    livePrice: mvnExchangeRate,
    // TODO: remove when mvn rate will be dynamic
    prevPrice: mvnExchangeRate - 0.00999,
  }

  const mvnRateChange = calcDiffBetweenTwoNumbersInPersentage(mvnStatsBlock.livePrice, mvnStatsBlock.prevPrice)

  return (
    <div className="mvnStats">
      <BGPrimaryTitleStyled>MVN</BGPrimaryTitleStyled>
      <div className="statsWrapper">
        <StatBlock>
          <div className="name">Market Cap</div>
          <div className="value">
            <CommaNumber value={mvnStatsBlock.marketCap} endingText="USD" />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Staked MVN</div>
          <div className="value">
            <CommaNumber value={mvnStatsBlock.stakedMvn} endingText="MVN" />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Live Price</div>
          <div className="value">
            <CommaNumber beginningText="$" value={mvnStatsBlock.livePrice} />
            <div className="impact-wrapper">
              <Impact value={mvnRateChange} endingText="% 24h" />
            </div>
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Circulating Supply</div>
          <div className="value">
            <CommaNumber value={mvnStatsBlock.circulatingSupply} endingText="MVN" />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Max Supply</div>
          <div className="value">
            <CommaNumber value={mvnStatsBlock.maxSupply} endingText="MVN" />
          </div>
        </StatBlock>
      </div>
    </div>
  )
}
