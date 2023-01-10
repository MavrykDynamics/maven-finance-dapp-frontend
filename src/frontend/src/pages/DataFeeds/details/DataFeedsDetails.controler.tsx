import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'

// view
import DataFeedDetailsView from './DataFeedsDetails.view'

// actions
import { getDelegationStorage, getOracleStorage, registerFeedAction } from 'pages/Satellites/Satellites.actions'
import { getDataFeedsHistory } from '../../Satellites/Satellites.actions'

const DataFeedDetails = () => {
  const dispatch = useDispatch()
  const {
    oraclesStorage: { feeds = [] },
    dataFeedsHistory,
    dataFeedsVolatility,
  } = useSelector((state: State) => state.oracles)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  let { feedId } = useParams<{ feedId: string }>()

  let [selectedFeed, setSelectedFeed] = useState<null | FeedGQL>(null)

  useEffect(() => {
    dispatch(getOracleStorage())
    dispatch(getDelegationStorage())
    dispatch(getDataFeedsHistory())
  }, [])

  useEffect(() => {
    setSelectedFeed(feeds.find((feed) => feed.address === feedId) || null)
  }, [feedId, feeds])

  return (
    <DataFeedDetailsView
      feed={selectedFeed}
      oracles={satelliteLedger}
      registerFeedHandler={() => dispatch(registerFeedAction())}
      dataFeedsHistory={dataFeedsHistory}
      dataFeedsVolatility={dataFeedsVolatility}
    />
  )
}

export default DataFeedDetails
