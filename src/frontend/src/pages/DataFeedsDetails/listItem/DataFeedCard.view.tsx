import { useLocation, Link } from 'react-router-dom'

import { parseDate } from 'utils/time'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Trim } from 'app/App.components/Trim/Trim.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { DataFeedsCardStyled, FeedsListItem } from 'pages/DataFeeds/DataFeeds.styles'
import { Feed } from 'providers/DataFeedsProvider/dataFeeds.provider.types'

export const DataFeedCard = ({ feed, oracleNodes }: { feed: Feed; oracleNodes: number }) => {
  const { pathname } = useLocation()

  const showAllColumns = pathname === '/data-feeds'

  return (
    <Link className="full-opacity" to={`/satellites/feed-details/${feed.address}`}>
      <DataFeedsCardStyled $isExtendedCard={showAllColumns}>
        <FeedsListItem className="with-img">
          <ImageWithPlug imageLink={feed.icon} alt={`${feed.name} logo`} />
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
