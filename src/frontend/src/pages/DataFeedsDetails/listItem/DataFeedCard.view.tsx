import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { State } from 'reducers'
import { parseDate } from 'utils/time'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Trim } from 'app/App.components/Trim/Trim.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { DataFeedsCardStyled, FeedsListItem } from 'pages/DataFeeds/DataFeeds.styles'

export const DataFeedCard = ({ feed, oracleNodes }: { feed: Feed; oracleNodes: number }) => {
  const { pathname } = useLocation()
  const { dipDupContracts } = useSelector((state: State) => state.tokens)

  const imageLink = dipDupContracts.find(({ contract }) => contract === feed.address)?.metadata?.icon
  const showAllColumns = pathname === '/data-feeds'

  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <DataFeedsCardStyled isExtendedCard={showAllColumns}>
        <FeedsListItem className="with-img">
          <ImageWithPlug imageLink={imageLink} alt={`${feed.name} logo`} />
          <h5>Feed</h5>
          <var>
            <Trim title={feed.name} />
          </var>
        </FeedsListItem>

        <FeedsListItem>
          <h5>Answer</h5>
          <var>
            <CommaNumber beginningText="$" value={feed.amount} />
          </var>
        </FeedsListItem>
        <FeedsListItem>
          <h5>Oracle Nodes</h5>
          <var>{oracleNodes}</var>
        </FeedsListItem>
        {showAllColumns && (
          <FeedsListItem>
            <h5>Category</h5>
            <var>{feed.category ?? 'No Category'}</var>
          </FeedsListItem>
        )}
        <FeedsListItem className="last-item">
          <h5>Date</h5>
          <var>
            {parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM Do, YYYY, HH:mm:ss' })}
          </var>
        </FeedsListItem>
      </DataFeedsCardStyled>
    </Link>
  )
}
