import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router-dom'

// types
import { State } from 'reducers'

// view
import DataFeedDetailsView from './DataFeedsDetails.view'

// actions
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'

const DataFeedDetails = () => {
  const dispatch = useDispatch()

  const { isLoading } = useDataFeedsUpdater()
  const { feedsMapper } = useDataFeedsContext()

  const { oraclesIds, satelliteMapper } = useSelector((state: State) => state.satellites)

  const timerId = useRef<null | NodeJS.Timeout>(null)
  const { feedId } = useParams<{ feedId: string }>()
  // const [selectedFeed, setSelectedFeed] = useState<null | Feed>(null)

  const selectedFeed = feedsMapper[feedId]

  /**
   * @description in this effect we need to update feeds data every
   * (last_completed_data_last_updated_at + heart_beat_seconds + 5000)ms
   * or every 30000ms, when user is on details page
   */
  // useEffect(() => {
  //   const feedToDisplay = feedsLedger.find((feed) => feed.address === feedId) ?? null
  //   setSelectedFeed(feedToDisplay)

  //   if (feedToDisplay) {
  //     const { last_completed_data_last_updated_at: lastUpdateTimestamp, heart_beat_seconds } = feedToDisplay
  //     const timeToUpdate =
  //       new Date(lastUpdateTimestamp ?? 0).getTime() + heart_beat_seconds * 1000 - new Date(Date.now()).getTime()

  //     const timer = setTimeout(() => dispatch(getFeedsStorage()), timeToUpdate < 0 ? 30000 : timeToUpdate + 5000)
  //     timerId.current = timer
  //   }

  //   return () => {
  //     if (timerId.current) clearTimeout(timerId.current)
  //   }
  // }, [feedId, feedsLedger])

  const feedsSatellites = useMemo(
    () =>
      selectedFeed?.address
        ? oraclesIds
            .filter((address) =>
              satelliteMapper[address].oracleRecords.find(({ feedAddress }) => selectedFeed.address === feedAddress),
            )
            .map((address) => satelliteMapper[address])
        : [],
    [selectedFeed?.address, oraclesIds, satelliteMapper],
  )

  if (!isLoading && !selectedFeed) return <Redirect to={'/data-feeds'} />

  return <DataFeedDetailsView isLoading={isLoading} feed={selectedFeed} feedsSatellites={feedsSatellites} />
}

export default DataFeedDetails
