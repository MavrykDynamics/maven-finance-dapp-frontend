import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// view
import DataFeedDetailsView from './DataFeedsDetails.view'

// actions
import { getOracleStorage, registerFeedAction } from 'pages/Satellites/Satellites.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

const DataFeedDetails = () => {
  const dispatch = useDispatch()
  const {
    oraclesStorage: { feeds = [] },
  } = useSelector((state: State) => state.oracles)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const timerId = useRef<null | number>(null)

  let { feedId } = useParams<{ feedId: string }>()

  let [selectedFeed, setSelectedFeed] = useState<null | Feed>(null)

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getOracleStorage())
    } catch (e) {}
  }, [])

  useEffect(() => {
    const feedToDisplay = feeds.find((feed) => feed.address === feedId)
    setSelectedFeed(feedToDisplay || null)

    if (feedToDisplay) {
      const timeToUpdate =
        new Date(feedToDisplay.last_completed_data_last_updated_at ?? 0).getTime() +
        feedToDisplay.heart_beat_seconds * 1000 -
        new Date(Date.now()).getTime()

      const timer = setTimeout(
        () => {
          dispatch(getOracleStorage())
        },
        timeToUpdate < 0 ? 30000 : timeToUpdate + 5000,
      )
      timerId.current = Number(timer)
    }

    return () => {
      if (timerId.current) clearTimeout(timerId.current)
    }
  }, [feedId, feeds])

  return (
    <DataFeedDetailsView
      feed={selectedFeed}
      oracles={satelliteLedger}
      registerFeedHandler={() => dispatch(registerFeedAction())}
    />
  )
}

export default DataFeedDetails
