import qs from 'qs'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// consts
import {
  FARMS_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  DEFAULT_FARMS_ACTIVE_SUBS,
} from 'providers/FarmsProvider/helpers/farms.const'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { SECONDARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

// utils

// view
import { Button } from 'app/App.components/Button/Button.controller'
import CoinsIcons from 'app/App.components/Icon/CoinsIcons.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { EmptyContainer, FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// hooks
import { useFarmsContext } from 'providers/FarmsProvider/farms.provider'
import { calculateAPY } from 'providers/FarmsProvider/helpers/farms.utils'

export const FarmsTab = () => {
  const { isLoading: isFarmsLoading, changeFarmsSubscriptionList, farmsMapper, allLiveFarms } = useFarmsContext()

  useEffect(() => {
    changeFarmsSubscriptionList({
      [FARMS_DATA_SUB]: FARMS_ALL_LIVE_DATA_SUB,
    })

    return () => {
      changeFarmsSubscriptionList(DEFAULT_FARMS_ACTIVE_SUBS)
    }
  }, [])

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
        ) : allLiveFarms.length ? (
          allLiveFarms.map((farmAddress) => {
            const farm = farmsMapper[farmAddress]
            const apy = calculateAPY(farm.currentRewardPerBlock, farm.liquidityTokenBalance)

            return (
              <Link
                to={`/yield-farms?${qs.stringify({ openedFarmsCards: [farm.address] })}`}
                key={farm.address + farm.name}
              >
                <div className="card">
                  <div className="top">
                    <div className="name">
                      <div className="large">{farm.name}</div>
                      <TzAddress tzAddress={farm.address} hasIcon type={SECONDARY_TZ_ADDRESS_COLOR} />
                    </div>

                    {/* <CoinsIcons
                      firstAssetLogoSrc={farmCardData.lpToken1.thumbnailUri}
                      secondAssetLogoSrc={farmCardData.lpToken2.thumbnailUri}
                    /> */}
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
                      <Timer deadline={farm.lastUpdateTime} />
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
