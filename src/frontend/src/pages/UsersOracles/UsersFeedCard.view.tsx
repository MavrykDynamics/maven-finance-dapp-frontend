import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Link } from 'react-router-dom'
import { parseDate } from 'utils/time'
import { Trim } from 'app/App.components/Trim/Trim.view'

import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

export const UserDataFeedCard = ({ feed }: { feed: Feed }) => {
  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <div className="userFeed">
        <div className="item">
          <h5>Feed</h5>
          <var>
            <Trim title={feed.name} />
          </var>
        </div>

        <div className="item">
          <h5>Contact address</h5>
          <var>
            <TzAddress tzAddress={feed.address} hasIcon={false} />
          </var>
        </div>

        <div className="item">
          <h5>Network</h5>
          <var>{feed.network || 'no network'}</var>
        </div>

        <div className="item">
          <h5>Category</h5>
          <var>{feed.category || 'no category'}</var>
        </div>

        <div className="item">
          <h5>Date</h5>
          <var>{parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM DD, YYYY' })}</var>
        </div>
      </div>
    </Link>
  )
}
