import { Link } from 'react-router-dom'

// utils
import { parseDate } from 'utils/time'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { MVK_TOKEN_SYMBOL } from 'utils/constants'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Trim } from 'app/App.components/Trim/Trim.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatBlock } from '../Dashboard.style'
import { EmptyContainer, OraclesContentStyled, PopularFeed, TabWrapperStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { BGPrimaryTitle } from 'pages/ContractStatuses/ContractStatuses.style'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

export const OraclesTab = () => {
  const { feedsAddresses, feedsMapper, isLoading: isFeedsLoading } = useDataFeedsContext()
  const {
    tokensPrices: { [MVK_TOKEN_SYMBOL]: mvkExchangeRate = 0 },
  } = useTokensContext()

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
                  <Link key={feed.address} className="full-opacity" to={`/satellites/feed-details/${feed.address}`}>
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
                          Last Update
                          <Tooltip>
                            <Tooltip.Trigger className="ml-5">
                              <Icon id="info" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              Last time the aggregator was updated with a trusted answer and written on-chain.
                            </Tooltip.Content>
                          </Tooltip>
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
          Satellites may also operate as nodes for Maven Finance’s decentralized oracle. Oracles provide price data for
          assets selected through governance, such as the collateral assets used in vaults and lending. They will then
          receive rewards in sMVK proportionate to their total voting power, and will distribute these rewards to their
          delegates.{' '}
          <a href="https://docs.mavryk.finance/mavryk-finance/satellites-and-oracles" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
