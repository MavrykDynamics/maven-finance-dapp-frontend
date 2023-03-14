import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { parseDate } from 'utils/time'
import { State } from 'reducers'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import colors from 'styles/colors'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { emptyContainer } from './LendingTab.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Trim } from 'app/App.components/Trim/Trim.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { StatBlock } from '../Dashboard.style'
import { OraclesContentStyled, TabWrapperStyled, PopularFeed } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'

export const OraclesTab = ({ isLoading }: { isLoading: boolean }) => {
  const { feedsLedger } = useSelector((state: State) => state.dataFeeds)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const {
    dipDupContracts,
    tokensPrices: { mvk: mvkExchangeRate = 0 },
  } = useSelector((state: State) => state.tokens)
  const { satelliteMapper, oraclesIds } = useSelector((state: State) => state.satellites)

  const oracleFeeds = feedsLedger.length
  const popularFeeds = feedsLedger.slice(0, 3)

  const oracleRewardsTotal = useMemo(
    () =>
      oraclesIds.reduce((acc, address) => {
        const sMVKReward = satelliteMapper[address].oracleRecords.reduce(
          (acc, { sMVKReward = 0 }) => (acc += sMVKReward),
          0,
        )
        return (acc += sMVKReward)
      }, 0),
    [satelliteMapper, oraclesIds],
  )

  return (
    <TabWrapperStyled className="oracles" backgroundImage="dashboard_oraclesTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Oracles</BGPrimaryTitle>
        <Link to="/data-feeds" className="dashboard-sectionLink">
          <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
            <Icon id="oracles" /> Oracle Feeds
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading oracles</div>
        </DataLoaderWrapper>
      ) : (
        <OraclesContentStyled>
          <div className="top padding-left">
            <StatBlock>
              <div className="name">Total Oracle Rewards Paid</div>
              <div className="value">
                <CommaNumber value={oracleRewardsTotal} endingText="sMVK" />
              </div>
              <div className="converted">
                <CommaNumber beginningText="$" value={oracleRewardsTotal * mvkExchangeRate} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Total Oracle Feeds</div>
              <div className="value">
                <CommaNumber value={oracleFeeds} />
              </div>
            </StatBlock>
          </div>

          <div className="block-name padding-left">Popular Feeds</div>

          {popularFeeds.length ? (
            <div className="feeds-grid">
              {popularFeeds.map((feed) => {
                const imageLink = dipDupContracts.find(({ contract }) => contract === feed.address)?.metadata?.icon

                return (
                  <Link key={feed.address} to={`/satellites/feed-details/${feed.address}`}>
                    <PopularFeed className="row">
                      <StatBlock className="icon-first">
                        <ImageWithPlug imageLink={imageLink} alt={`${feed.name} logo`} />
                        <div className="name">Feed</div>
                        <div className="value">
                          <Trim title={feed.name} />
                        </div>
                      </StatBlock>
                      <StatBlock>
                        <div className="name">Answer</div>
                        <div className="value">
                          <CommaNumber beginningText="$" value={feed.amount} />
                        </div>
                      </StatBlock>
                      <StatBlock>
                        <div className="name">Oracle Nodes</div>
                        <div className="value">
                          <CommaNumber value={feed.oracles.length} />
                        </div>
                      </StatBlock>
                      <StatBlock>
                        <div className="name">
                          Last Update{' '}
                          <CustomTooltip
                            iconId="info"
                            defaultStrokeColor={colors[themeSelected].textColor}
                            text="Last time the aggregator was updated with a trusted answer and written on-chain."
                          />
                        </div>
                        <div className="value">
                          {parseDate({
                            time: feed.last_completed_data_last_updated_at,
                            timeFormat: 'DD MMM YYYY, HH:mm UTC',
                          })}
                        </div>
                      </StatBlock>
                    </PopularFeed>
                  </Link>
                )
              })}
            </div>
          ) : (
            emptyContainer
          )}
        </OraclesContentStyled>
      )}

      <div className="descr">
        <div className="title">What are Oracles?</div>
        <div className="text">
          Satellites also operate as nodes for Mavryk Finance’s decentralized oracle. Oracles provide price data for the
          assets used as collateral in the vaults. As a reward for this work, Satellites earn sMVK relative to their
          sMVK deposit and delegated sMVK, and pay out rewards to their delegates.{' '}
          <a href="https://mavryk.finance/litepaper#satellites" target="_blank" rel="noreferrer">
            Read more
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
