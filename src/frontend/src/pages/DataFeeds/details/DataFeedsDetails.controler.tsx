import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// view
import DataFeedDetailsView from './DataFeedsDetails.view'

// actions
import { getOracleStorage, registerFeedAction } from 'pages/Satellites/Satellites.actions'

const DataFeedDetails = () => {
  const dispatch = useDispatch()
  const {
    oraclesStorage: { feeds = [] },
  } = useSelector((state: State) => state.oracles)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  let { feedId } = useParams<{ feedId: string }>()

  let [selectedFeed, setSelectedFeed] = useState<null | Feed>(null)

  useEffect(() => {
    dispatch(getOracleStorage())
  }, [])

  useEffect(() => {
    setSelectedFeed(feeds.find((feed) => feed.address === feedId) || null)
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
