import { Link } from 'react-router-dom'

// utils
import { parseDate } from 'utils/time'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { MVK_TOKEN_SYMBOL } from 'utils/constants'
import colors from 'styles/colors'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Trim } from 'app/App.components/Trim/Trim.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { StatBlock } from '../Dashboard.style'
import { OraclesContentStyled, TabWrapperStyled, PopularFeed, EmptyContainer } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'

export const OraclesTab = () => {
  const { feedsAddresses, feedsMapper, isLoading: isFeedsLoading } = useDataFeedsContext()
  const {
    tokensPrices: { [MVK_TOKEN_SYMBOL]: mvkExchangeRate = 0 },
  } = useTokensContext()
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const { oracleRewardsTotal } = useSatelliteStatistics()

  const oracleFeeds = feedsAddresses.length
  const popularFeeds = feedsAddresses.slice(0, 3)

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

      {isFeedsLoading ? (
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
              {popularFeeds.map((feedAddress) => {
                const feed = feedsMapper[feedAddress]

                if (!feed) return null

                return (
                  <Link key={feed.address} to={`/satellites/feed-details/${feed.address}`}>
                    <PopularFeed className="row">
                      <StatBlock className="icon-first">
                        <ImageWithPlug imageLink={feed.icon} alt={`${feed.name} logo`} />
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
                          <CommaNumber value={feed.oraclesAmount} />
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
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No active oracles to show" />
              <figcaption> No active oracles to show</figcaption>
            </EmptyContainer>
          )}
        </OraclesContentStyled>
      )}

      <div className="descr">
        <div className="title">What are Oracles?</div>
        <div className="text">
          Satellites may also operate as nodes for Mavryk Finance’s decentralized oracle. Oracles provide price data for
          assets selected through governance, such as the collateral assets used in vaults and lending. They will then
          receive rewards in sMVK proportionate to their total voting power, and will distribute these rewards to their
          delegates.{' '}
          <a href="https://mavryk.finance/litepaper#satellites" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
