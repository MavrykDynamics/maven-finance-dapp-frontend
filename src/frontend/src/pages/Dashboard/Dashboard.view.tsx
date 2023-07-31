import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Link } from 'react-router-dom'
import { BGPrimaryTitleStyled, DashboardStyled, StatBlock } from './Dashboard.style'
import {
  FARMS_TAB_ID,
  LENDING_TAB_ID,
  mvkStatsType,
  ORACLES_TAB_ID,
  SATELLITES_TAB_ID,
  STAKING_TAB_ID,
  TabId,
  TREASURY_TAB_ID,
  VAULTS_TAB_ID,
} from './Dashboard.utils'
import { FarmsTab } from './TabScreens/FarmsTab.controller'
import { LendingTab } from './TabScreens/LendingTab.controller'
import { OraclesTab } from './TabScreens/OraclesTab.controller'
import { SatellitesTab } from './TabScreens/SatellitesTab.controller'
import { TreasuryTab } from './TabScreens/TreasuryTab.controller'
import { VaultsTab } from './TabScreens/VaultsTab.controller'
import { StakingTab } from './TabScreens/StakingTab.controller'
import { calcDiffBetweenTwoNumbersInPersentage } from 'utils/calcFunctions'
import { Impact } from 'app/App.components/Impact/Impact'
import { CustomLink } from 'app/App.components/CustomLink/CustomLink'

const TabById = ({ activeTab, isDataLoading }: { activeTab: TabId; isDataLoading: boolean }) => {
  switch (activeTab) {
    case LENDING_TAB_ID:
      return <LendingTab isLoading={isDataLoading} />
    case VAULTS_TAB_ID:
      return <VaultsTab isLoading={isDataLoading} />
    case FARMS_TAB_ID:
      return <FarmsTab isLoading={isDataLoading} />
    case SATELLITES_TAB_ID:
      return <SatellitesTab isLoading={isDataLoading} />
    case ORACLES_TAB_ID:
      return <OraclesTab isLoading={isDataLoading} />
    case TREASURY_TAB_ID:
      return <TreasuryTab isLoading={isDataLoading} />
    case STAKING_TAB_ID:
      return <StakingTab isLoading={isDataLoading} />
  }
}

export const DashboardView = ({
  tvl,
  mvkStatsBlock,
  activeTab,
  isLoading,
}: {
  tvl: number
  mvkStatsBlock: mvkStatsType
  activeTab: TabId
  isLoading: boolean
}) => {
  const mvkRateChange = calcDiffBetweenTwoNumbersInPersentage(mvkStatsBlock.livePrice, mvkStatsBlock.prevPrice)

  return (
    <DashboardStyled>
      <div className="top">
        <div className="tvlBlock">
          <BGPrimaryTitleStyled>Mavryk TVL</BGPrimaryTitleStyled>
          <CommaNumber beginningText="$" value={isLoading ? 0 : tvl} />
        </div>

        <div className="mvkStats">
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
        </div>
      </div>

      <div className="dashboard-navigation">
        <CustomLink
          to={`/${LENDING_TAB_ID}`}
          styling={{ [activeTab === LENDING_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Earn/Borrow
        </CustomLink>
        <CustomLink
          to={`/?tab=${VAULTS_TAB_ID}`}
          styling={{ [activeTab === VAULTS_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Vaults
        </CustomLink>
        <CustomLink
          to={`/?tab=${STAKING_TAB_ID}`}
          styling={{ [activeTab === STAKING_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Staking
        </CustomLink>
        <CustomLink
          to={`/?tab=${SATELLITES_TAB_ID}`}
          styling={{ [activeTab === SATELLITES_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Satellites
        </CustomLink>
        <CustomLink
          to={`/?tab=${TREASURY_TAB_ID}`}
          styling={{ [activeTab === TREASURY_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Treasury
        </CustomLink>
        <CustomLink
          to={`/?tab=${FARMS_TAB_ID}`}
          styling={{ [activeTab === FARMS_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Farms
        </CustomLink>
        <CustomLink
          to={`/?tab=${ORACLES_TAB_ID}`}
          styling={{ [activeTab === ORACLES_TAB_ID ? 'navigationActiveLink' : 'navigationLink']: true }}
        >
          Oracles
        </CustomLink>
      </div>

      <TabById activeTab={activeTab} isDataLoading={isLoading} />
    </DashboardStyled>
  )
}
