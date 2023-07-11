import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'

// consts
import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// style
import { SatellitePaginationStyled } from 'pages/SatelliteDetails/SatellitePagination/SatellitePagination.style'
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
