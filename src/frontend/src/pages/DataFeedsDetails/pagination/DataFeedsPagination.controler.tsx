import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { SatellitePaginationStyled } from 'pages/SatelliteDetails/SatellitePagination/SatellitePagination.style'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

const DataFeedsPagination = () => {
  let { feedId = '' } = useParams<{ feedId: string }>()
  const { feedsAddresses } = useDataFeedsContext()

  const currentFeedIdx = useMemo(
    () => feedsAddresses.findIndex((address) => address === feedId),
    [feedsAddresses, feedId],
  )

  const prevFeed = feedsAddresses.at(currentFeedIdx - 1) ?? feedsAddresses.at(-1)
  const nextFeed = feedsAddresses.at(currentFeedIdx + 1) ?? feedsAddresses.at(0)

  return (
    <SatellitePaginationStyled style={{ marginTop: '20px' }}>
      <Link to={`/data-feeds`} className="go-back">
        <NewButton kind={BUTTON_SECONDARY}>
          <Icon id="full-arrow-left" /> Back to feeds
        </NewButton>
      </Link>
      {prevFeed ? (
        <Link className="pagination-link prev" to={`/satellites/feed-details/${prevFeed}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous feed
        </Link>
      ) : null}
      {nextFeed ? (
        <Link className="pagination-link next" to={`/satellites/feed-details/${nextFeed}`}>
          Next feed
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default DataFeedsPagination
