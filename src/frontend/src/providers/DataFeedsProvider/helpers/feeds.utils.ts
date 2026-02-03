import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import {
  DataFeedsContext,
  NullableDataFeedsContextStateType,
} from '../dataFeeds.provider.types'
import { EMPTY_DATA_FEEDS_CTX } from './feeds.consts'

type DataFeedsContextReturnValueArgs = {
  feedsCtxState: NullableDataFeedsContextStateType
  updateFeedsHistoryAndVolatility: DataFeedsContext['updateFeedsHistoryAndVolatility']
  resetFeedsHistoryAndVolatility: DataFeedsContext['resetFeedsHistoryAndVolatility']
}

export const getDataFeedsProviderReturnValue = ({
  feedsCtxState,
  updateFeedsHistoryAndVolatility,
  resetFeedsHistoryAndVolatility,
}: DataFeedsContextReturnValueArgs) => {
  const { feedsMapper, feedsAddresses, feedsCategories, dataFeedsVolatility, dataFeedsHistory } = feedsCtxState

  const isLoading = feedsMapper === null || feedsAddresses === null || feedsCategories === null

  return buildProviderReturnValue(
    feedsCtxState,
    EMPTY_DATA_FEEDS_CTX,
    {
      updateFeedsHistoryAndVolatility,
      resetFeedsHistoryAndVolatility,
      dataFeedsVolatility,
      dataFeedsHistory,
    },
    isLoading,
  )
}
