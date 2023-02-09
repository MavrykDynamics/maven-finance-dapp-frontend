import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Trim } from 'app/App.components/Trim/Trim.view'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { parseDate } from 'utils/time'
import { StatBlock } from '../Dashboard.style'
import { OraclesContentStyled, TabWrapperStyled, PopularFeed } from './DashboardTabs.style'
import { emptyContainer } from './LendingTab.controller'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

export const OraclesTab = ({ isLoading }: { isLoading: boolean }) => {
  const dispatch = useDispatch()
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const { dipDupContracts } = useSelector((state: State) => state.tokens)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { satelliteLedger = [] } = useSelector((state: State) => state.delegation.delegationStorage)

  const oracleFeeds = feeds.length
  const popularFeeds = feeds.slice(0, 3)

  useEffect(() => {
    dispatch(getOracleStorage())
  }, [dispatch])

  const oracleRevardsTotal = useMemo(
    () =>
      satelliteLedger.reduce((acc, { oracleRecords }) => {
        if (oracleRecords.length) {
          const sMVKReward = oracleRecords.reduce((acc, { sMVKReward = 0 }) => (acc += sMVKReward), 0)
          acc += sMVKReward * exchangeRate
        }
        return acc
      }, 0),
    [exchangeRate, satelliteLedger],
  )

  return (
    <TabWrapperStyled className="oracles" backgroundImage="dashboard_oraclesTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Oracles</BGPrimaryTitle>
        <Link to="/data-feeds">
          <Button text="Oracle Feeds" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
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
                <CommaNumber beginningText="$" value={oracleRevardsTotal} />
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
                // TODO: remove it when images will be ok in indexer
                const imageLink = feed.name.includes('EUROC')
                  ? '/images/eurl.png'
                  : feed.name.includes('XTZ')
                  ? '/images/tezos.png'
                  : dipDupContracts.find(({ contract }) => contract === feed.address)?.metadata?.icon

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
                        <div className="name">Contract Address</div>
                        <div className="value">
                          <TzAddress type={BLUE} tzAddress={feed.address} hasIcon />
                        </div>
                      </StatBlock>
                      <StatBlock>
                        <div className="name">Date/Time</div>
                        <div className="value">
                          {parseDate({
                            time: feed.last_completed_data_last_updated_at,
                            timeFormat: 'DD MMM YYYY / HH:mm',
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
          Satellites are nodes of Mavryk's decentralized oracle. Oracles provide price data for the asset classes that
          can be used as collateral for the CDPs (XTZ, wWBTC, wWETH, etc.). Satellites that provide Oracle pricing
          information earn sMVK.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
            Read more
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
