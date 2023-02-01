import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Trim } from 'app/App.components/Trim/Trim.view'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { State } from 'reducers'
import { parseDate } from 'utils/time'

import { SatelliteItemStyle } from './SatelliteCard.style'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

export const handleCoinName = (name: string) => {
  const updatedName = name.split('/')?.[1]

  if (!updatedName && name.includes('USD')) {
    return name.slice(3)
  }

  return updatedName
}

const defaultCategoryText = 'No Category'

export const DataFeedCard = ({ feed }: { feed: Feed }) => {
  const { pathname } = useLocation()
  const { dipDupContracts } = useSelector((state: State) => state.tokens)
  const imageLink = feed?.name.includes('EUROC')
    ? '/images/eurl.png'
    : dipDupContracts.find(({ contract }) => contract === feed?.address)?.metadata?.icon
  const isDataFeedsPage = pathname === '/data-feeds'

  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="feed" isDataFeeds={isDataFeedsPage}>
        <div className="item with-img">
          <CoinsLogo imageLink={imageLink} assetName={handleCoinName(feed.name)} />
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
        {isDataFeedsPage && (
          <div className="item">
            <h5>Category</h5>
            <var>{feed.category || defaultCategoryText}</var>
          </div>
        )}
        <div className="item feed-last">
          <h5>Date</h5>
          <var>{parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM DD, YYYY' })}</var>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
