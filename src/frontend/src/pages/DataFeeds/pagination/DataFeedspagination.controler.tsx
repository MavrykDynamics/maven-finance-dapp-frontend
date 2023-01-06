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
  const { feeds = [] } = useSelector((state: State) => state.oracles.oraclesStorage)

  const prevIndex = useMemo(() => {
    return feeds.findIndex((item) => item.address === feedId) || 0
  }, [feeds, feedId])

  const prevFeed = feeds?.[prevIndex - 1]
  const nextFeed = feeds?.[prevIndex + 1]

  return (
    <SatellitePaginationStyled>
      <NewButton kind={TRANSPARENT_WITH_BORDER} className="go-back">
        <Link to={`/data-feeds`}>
          <Icon id="arrowRight" /> Back to feeds
        </Link>
      </NewButton>
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
