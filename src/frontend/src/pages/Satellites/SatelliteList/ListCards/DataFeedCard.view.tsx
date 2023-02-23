import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { State } from 'reducers'
import { parseDate } from 'utils/time'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Trim } from 'app/App.components/Trim/Trim.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

import { SatelliteItemStyle } from './SatelliteCard.style'

const defaultCategoryText = 'No Category'

export const DataFeedCard = ({ feed }: { feed: Feed }) => {
  const { pathname } = useLocation()
  const { dipDupContracts } = useSelector((state: State) => state.tokens)

  const imageLink = dipDupContracts.find(({ contract }) => contract === feed.address)?.metadata?.icon
  const showAllColumns = pathname === '/data-feeds'

  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="feed" isDataFeeds={showAllColumns}>
        <div className="item with-img">
          <ImageWithPlug imageLink={imageLink} alt={`${feed.name} logo`} />
          <h5>Feed</h5>
          <var>
            <Trim title={feed.name} />
          </var>
        </div>
        <div className="item">
          <h5>Answer</h5>
          <var>
            <CommaNumber beginningText="$" value={feed.amount} />
          </var>
        </div>
        <div className="item">
          <h5>Contract address</h5>
          <var>
            <TzAddress tzAddress={feed.address} hasIcon={true} type={BLUE} />
          </var>
        </div>
        {showAllColumns && (
          <div className="item">
            <h5>Category</h5>
            <var>{feed.category || defaultCategoryText}</var>
          </div>
        )}
        <div className="item feed-last">
          <h5>Date</h5>
          <var>
            {parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM Do, YYYY, HH:mm:ss' })}
          </var>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
