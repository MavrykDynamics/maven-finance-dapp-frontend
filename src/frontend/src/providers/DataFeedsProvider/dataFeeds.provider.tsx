import React, { useContext } from 'react'

// types
import { State, Props, DataFeedsContext } from './dataFeeds.provider.types'
import { normalizeFeeds } from './helpers/normalizer'
import { GetOracleDataFeedsQuery } from 'utils/__generated__/graphql'

export const dataFeedsContext = React.createContext<DataFeedsContext>(undefined!)

export class DataFeedsProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        feedsLedger: [],
        feedCategories: [],
        isLoaded: false,
        // actions
        initializeDataFeeds: this.initializeDataFeeds,
        registerFeedAction: this.registerFeedAction,
      },
    }
  }

  initializeDataFeeds = (data: GetOracleDataFeedsQuery, isOneFeed = false) => {
    const normalizedFeedsStorage = normalizeFeeds(data)
    const { feedCategories, feedsLedger } = normalizedFeedsStorage

    const _feedsLedger = isOneFeed
      ? [...this.state.context.feedsLedger.filter((el) => el.address !== feedsLedger[0].address), ...feedsLedger]
      : feedsLedger

    this.setState({
      context: {
        ...this.state.context,
        feedCategories,
        feedsLedger: _feedsLedger,
        isLoaded: true,
      },
    })
  }

  updateDataFeedDetails = (data: GetOracleDataFeedsQuery) => {}

  registerFeedAction = () => {
    console.info('Unimplemented')
  }

  render(): React.ReactNode {
    return <dataFeedsContext.Provider value={this.state.context}>{this.props.children}</dataFeedsContext.Provider>
  }
}

export const useDataFeedsContext = () => {
  const context = useContext(dataFeedsContext)

  if (!context) {
    throw new Error('dataFeedsContext should be used within Data Feeds provider')
  }

  return context
}

export default DataFeedsProvider
