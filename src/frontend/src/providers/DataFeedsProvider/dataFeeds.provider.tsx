import React, { useContext } from 'react'

// types
import { State, Props, DataFeedsContext } from './dataFeeds.provider.types'
import { normalizeFeeds } from './helpers/feedsNormalizer'
import { GetOracleDataFeedsQuery } from 'utils/__generated__/graphql'

export const dataFeedsContext = React.createContext<DataFeedsContext>(undefined!)

export class DataFeedsProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        feedsAddresses: [],
        feedsMapper: {},
        feedsCategories: [],
        // actions
        updateDataFeeds: this.updateDataFeeds,
        registerFeedAction: this.registerFeedAction,
      },
    }
  }

  updateDataFeeds = (data: GetOracleDataFeedsQuery['aggregator'], isOneFeed = false) => {
    const { feedsCategories, feedsAddresses, feedsMapper } = normalizeFeeds(data, this.props.dipDupContracts)

    console.log({
      dipDup: this.props.dipDupContracts,
      feeds: data,
      feedsCategories,
      feedsAddresses,
      feedsMapper,
    })

    this.setState({
      context: {
        ...this.state.context,
        feedsCategories,
        feedsAddresses,
        feedsMapper,
      },
    })
  }

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
