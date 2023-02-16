import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { SatellitePaginationStyled } from 'pages/Satellites/SatellitePagination/SatellitePagination.style'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

const DataFeedsPagination = () => {
  let { feedId = '' } = useParams<{ feedId: string }>()
  const { feedsLedger } = useSelector((state: State) => state.dataFeeds)

  const currentFeedIdx = useMemo(() => feedsLedger.findIndex((item) => item.address === feedId), [feedsLedger, feedId])

  const prevFeed = feedsLedger[currentFeedIdx - 1]
  const nextFeed = feedsLedger[currentFeedIdx + 1]

  return (
    <SatellitePaginationStyled className="data-feeds-pagination">
      <Link to={`/data-feeds`} className="go-back">
        <NewButton kind={TRANSPARENT_WITH_BORDER} className="go-back">
          <Icon id="arrowRight" /> Back to feeds
        </NewButton>
      </Link>
      {prevFeed ? (
        <Link className="pagination-link prev" to={`/satellites/feed-details/${prevFeed.address}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous feed
        </Link>
      ) : null}
      {nextFeed ? (
        <Link className="pagination-link next" to={`/satellites/feed-details/${nextFeed.address}`}>
          Next feed
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default DataFeedsPagination
