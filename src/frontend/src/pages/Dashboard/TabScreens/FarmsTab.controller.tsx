import qs from 'qs'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// consts
import {
  DEFAULT_FARMS_ACTIVE_SUBS,
  FARMS_ALL_LIVE_DATA_SUB,
  FARMS_DATA_SUB,
} from 'providers/FarmsProvider/helpers/farms.const'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  FARM_CARD_COINS_LARGE,
  FARM_CARD_COINS_SMALL,
  FarmCardCoinIcons,
} from 'pages/Farms/components/FarmCard/cardParts/FarmCardCoinIcons'

// types
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

// utils
import { calculateFarmAPY } from 'providers/FarmsProvider/helpers/farms.utils'
import { checkWhetherTokenIsFarmToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { BGPrimaryTitle } from 'pages/ContractStatuses/ContractStatuses.style'
import { EmptyContainer, FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// hooks
import { useFarmsContext } from 'providers/FarmsProvider/farms.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

type DashboardSmallFarmCardDataType = {
  address: string
  isMFarm: boolean
  infinite: boolean
  name: string
  farmToken: FarmsTokenMetadataType
  apy: number
  creatorAddress: string
  endsInTime: string
}

type MostActiveFarmType = {
  address: string
  isMFarm: boolean
  name: string
  farmToken: FarmsTokenMetadataType
  totalLiquidityAmount: number
} | null

export const FarmsTab = () => {
  const { tokensMetadata } = useTokensContext()
  const { isLoading: isFarmsLoading, changeFarmsSubscriptionList, farmsMapper, allLiveFarms } = useFarmsContext()

  useEffect(() => {
    changeFarmsSubscriptionList({
      [FARMS_DATA_SUB]: FARMS_ALL_LIVE_DATA_SUB,
    })

    return () => {
      changeFarmsSubscriptionList(DEFAULT_FARMS_ACTIVE_SUBS)
    }
  }, [])

  const { highestAPY, mostActiveFarm, farmsToIterate } = useMemo(
    () =>
      allLiveFarms.reduce<{
        highestAPY: number
        mostActiveFarm: MostActiveFarmType
        farmsToIterate: Array<DashboardSmallFarmCardDataType>
      }>(
        (acc, farmAddress) => {
          const farm = farmsMapper[farmAddress]
          const farmToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: farm?.liquidityTokenAddress })

          if (!farm || !farmToken || !checkWhetherTokenIsFarmToken(farmToken)) return acc

          const { decimals: grade } = farmToken
          const {
            liquidityTokenBalance,
            currentRewardPerBlock,
            name,
            address,
            creatorAddress,
            isMFarm,
            endsInTime,
            infinite,
          } = farm

          const totalLiquidityAmount = convertNumberForClient({ number: liquidityTokenBalance, grade })
          const farmApy = calculateFarmAPY(currentRewardPerBlock, totalLiquidityAmount)

          if (acc.highestAPY <= farmApy) acc.highestAPY = farmApy

          if ((acc.mostActiveFarm?.totalLiquidityAmount ?? 0) <= totalLiquidityAmount) {
            acc.mostActiveFarm = {
              address,
              farmToken,
              isMFarm,
              name,
              totalLiquidityAmount,
            }
          }

          acc.farmsToIterate.push({
            apy: farmApy,
            address,
            name,
            creatorAddress,
            endsInTime,
            farmToken,
            isMFarm,
            infinite,
          })

          return acc
        },
        { highestAPY: 0, mostActiveFarm: null, farmsToIterate: [] },
      ),
    [allLiveFarms, farmsMapper, tokensMetadata],
  )

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
          <>
            <div className="farms-stats">
              <div className="collumn">
                <div className="name">Number of active farms</div>
                <CommaNumber value={allLiveFarms.length} className="value" />
              </div>

              <div className="collumn">
                <div className="name">Highest APY</div>
                <CommaNumber value={highestAPY} className="value" endingText="%" />
              </div>

              <div className="collumn">
                <div className="name">Most Active Farm</div>
                <div className="value">
                  {mostActiveFarm ? (
                    <>
                      <FarmCardCoinIcons
                        farmToken={mostActiveFarm.farmToken}
                        isMFarm={mostActiveFarm.isMFarm}
                        size={FARM_CARD_COINS_SMALL}
                      />{' '}
                      {mostActiveFarm.name}
                    </>
                  ) : (
                    '–'
                  )}
                </div>
              </div>
            </div>
            <div className="farms-list scroll-block">
              {farmsToIterate.map((farmData) => {
                const { address, apy, name, creatorAddress, endsInTime, farmToken, isMFarm, infinite } = farmData

                return (
                  <Link to={`/yield-farms?${qs.stringify({ openedFarmsCards: [address] })}`} key={address}>
                    <div className="card">
                      <div className="top">
                        <div className="name">
                          <div className="large">{name}</div>
                          {/* <TzAddress
                            tzAddress={creatorAddress}
                            type={PRIMARY_TZ_ADDRESS_COLOR}
                            className="creator"
                            hasIcon={false}
                          /> */}
                        </div>

                        <FarmCardCoinIcons farmToken={farmToken} isMFarm={isMFarm} size={FARM_CARD_COINS_LARGE} />
                      </div>

                      <div className="row-info">
                        <div className="name">APY:</div>
                        <CommaNumber value={apy} className="value" endingText="%" />
                      </div>

                      <div className="row-info">
                        <div className="name">Earn:</div>
                        <div className="value">sMVN + Fees</div>
                      </div>

                      <div className="row-info">
                        <div className="name">Ends in:</div>
                        <div className="value">{infinite ? 'Not ending' : <Timer deadline={endsInTime} />}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
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
          Liquidity providers will be able to stake their LP tokens within yield farms to receive sMVN as an incentive.
          DEX LP tokens and Maven Finance mTokens may be staked to available farms. By default, Maven Finance farms are
          spawned for three months.{' '}
          <a href="https://docs.mavryk.finance/mavryk-finance/yield-farms" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
