import React, { useContext } from 'react'

// types
import { State, Props, DataFeedsContext } from './dataFeeds.provider.types'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

// helpers
import { normalizeFeeds } from './helpers/feedsNormalizer'

export const dataFeedsContext = React.createContext<DataFeedsContext>(undefined!)
const propomitionAddresses = [
  'KT1AgXce6SwfMNQ6wcKGALHi46FuN77bHioV',
  'KT1C1sYNxacr8LPZimA512gAfWajdGah75nq',
  'KT1BYGLiHStMzdv2WCikKKDtFtvUjxzZ8WB9',
]
export class DataFeedsProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        // data
        feedsAddresses: [],
        feedsMapper: {},
        feedsCategories: [],
        // actions
        updateDataFeeds: this.updateDataFeeds,
        registerFeedAction: this.registerFeedAction,
      },
    }
  }

  updateDataFeeds = (data: SubsribeOracleDataFeedSubscription['aggregator']) => {
    const { feedsCategories, feedsAddresses, feedsMapper } = normalizeFeeds(data, propomitionAddresses)

    this.setState({
      context: {
        ...this.state.context,
        feedsCategories: Array.from(new Set([...this.state.context.feedsCategories, ...feedsCategories])),
        feedsAddresses: Array.from(new Set([...this.state.context.feedsAddresses, ...feedsAddresses])),
        feedsMapper: { ...this.state.context.feedsMapper, ...feedsMapper },
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
