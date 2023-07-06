import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Link } from 'react-router-dom'
import { DashboardStyled, StatBlock, BGPrimaryTitleStyled } from './Dashboard.style'
import {
  FARMS_TAB_ID,
  LENDING_TAB_ID,
  mvkStatsType,
  ORACLES_TAB_ID,
  SATELLITES_TAB_ID,
  TabId,
  TREASURY_TAB_ID,
  VAULTS_TAB_ID,
  STAKING_TAB_ID,
} from './Dashboard.utils'
import { FarmsTab } from './TabScreens/FarmsTab.controller'
import { LendingTab } from './TabScreens/LendingTab.controller'
import { OraclesTab } from './TabScreens/OraclesTab.controller'
import { SatellitesTab } from './TabScreens/SatellitesTab.controller'
import { TreasuryTab } from './TabScreens/TreasuryTab.controller'
import { VaultsTab } from './TabScreens/VaultsTab.controller'
import { StakingTab } from './TabScreens/StakingTab.controller'
import { ApiError, FatalError, ValidationError } from 'errors/error'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useState } from 'react'

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
  const { fatal } = useToasterContext()
  const [hasError, setHasError] = useState(false)

  const renderTest = () => {
    if (hasError) {
      throw new Error('Has error test')
    }

    return <div>Test (this component will throw error which will be catch inside ComponentDidCatch)</div>
  }

  return (
    <DashboardStyled>
      <div className="top">
        <div className="tvlBlock">
          <BGPrimaryTitleStyled>Mavryk TVL</BGPrimaryTitleStyled>
          <CommaNumber beginningText="$" value={isLoading ? 0 : tvl} />
        </div>

        {renderTest()}

        <button
          onClick={() => {
            fatal(new FatalError('Fatal error'))
          }}
        >
          Fatal error
        </button>
        <button
          onClick={() => {
            setHasError(true)
          }}
        >
          Trigger componentDidCatch error
        </button>
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
                <div className={`impact ${mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? 'up' : 'down'}`}>
                  {mvkStatsBlock.livePrice >= mvkStatsBlock.prevPrice ? '+' : '-'}{' '}
                  {mvkStatsBlock.livePrice * 100 - mvkStatsBlock.prevPrice * 100}%
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
        <Link to={`/${LENDING_TAB_ID}`} className={activeTab === LENDING_TAB_ID ? 'selected' : ''}>
          Lending
        </Link>
        <Link to={`/?tab=${VAULTS_TAB_ID}`} className={activeTab === VAULTS_TAB_ID ? 'selected' : ''}>
          Vaults
        </Link>
        <Link to={`/?tab=${STAKING_TAB_ID}`} className={activeTab === STAKING_TAB_ID ? 'selected' : ''}>
          Staking
        </Link>
        <Link to={`/?tab=${SATELLITES_TAB_ID}`} className={activeTab === SATELLITES_TAB_ID ? 'selected' : ''}>
          Satellites
        </Link>
        <Link to={`/?tab=${TREASURY_TAB_ID}`} className={activeTab === TREASURY_TAB_ID ? 'selected' : ''}>
          Treasury
        </Link>
        <Link to={`/?tab=${FARMS_TAB_ID}`} className={activeTab === FARMS_TAB_ID ? 'selected' : ''}>
          Farms
        </Link>
        <Link to={`/?tab=${ORACLES_TAB_ID}`} className={activeTab === ORACLES_TAB_ID ? 'selected' : ''}>
          Oracles
        </Link>
      </div>

      <TabById activeTab={activeTab} isDataLoading={isLoading} />
    </DashboardStyled>
  )
}
