import qs from 'qs'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { SECONDARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { calculateAPY } from 'pages/Farms/Farms.helpers'

import { Button } from 'app/App.components/Button/Button.controller'
import CoinsIcons from 'app/App.components/Icon/CoinsIcons.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { EmptyContainer, FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

export const FarmsTab = () => {
  // TODO: use from context, when context will be here
  const isFarmsLoading = false
  const { farms } = useSelector((state: State) => state.farm)
  // On dashboard farms tab show only live farms

  const liveNotStakedFarms = useMemo(() => farms.filter(({ isLive }) => isLive), [farms])

  return (
    <TabWrapperStyled backgroundImage="dashboard_farmsTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Yield Farms</BGPrimaryTitle>
        <Link to="/yield-farms?isLive=1">
          <Button text="Farms" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      <FarmsContentStyled className="scroll-block">
        {isFarmsLoading ? (
          <DataLoaderWrapper className="tabLoader">
            <ClockLoader width={150} height={150} />
            <div className="text">Loading farms</div>
          </DataLoaderWrapper>
        ) : liveNotStakedFarms.length ? (
          farms.map((farmCardData) => {
            const apy = calculateAPY(farmCardData.currentRewardPerBlock, farmCardData.lpBalance)
            return (
              <Link
                to={`/yield-farms?${qs.stringify({ openedFarmsCards: [farmCardData.address] })}`}
                key={farmCardData.address + farmCardData.name}
              >
                <div className="card">
                  <div className="top">
                    <div className="name">
                      <div className="large">{farmCardData.name}</div>
                      <TzAddress tzAddress={farmCardData.address} hasIcon type={SECONDARY_TZ_ADDRESS_COLOR} />
                    </div>

                    <CoinsIcons
                      firstAssetLogoSrc={farmCardData.lpToken1.thumbnailUri}
                      secondAssetLogoSrc={farmCardData.lpToken2.thumbnailUri}
                    />
                  </div>

                  <div className="row-info">
                    <div className="name">APY: </div>
                    <div className="value">{apy}</div>
                  </div>

                  <div className="row-info">
                    <div className="name">Earn: </div>
                    <div className="value">sMVK + Fees</div>
                  </div>

                  <div className="row-info">
                    <div className="name">Ends in: </div>
                    <div className="value">
                      <Timer deadline={farmCardData.endsIn} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <EmptyContainer>
            <img src="/images/not-found.svg" alt=" No live farms to show" />
            <figcaption> No live farms to show</figcaption>
          </EmptyContainer>
        )}
      </FarmsContentStyled>

      <div className="descr">
        <div className="title">What is Yield Farming?</div>
        <div className="text">
          Liquidity providers will be able to stake their LP tokens within yield farms to receive sMVK as an incentive.
          DEX LP tokens and Mavryk mTokens may be staked to available farms. By default, Mavryk farms are spawned for
          three months.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
