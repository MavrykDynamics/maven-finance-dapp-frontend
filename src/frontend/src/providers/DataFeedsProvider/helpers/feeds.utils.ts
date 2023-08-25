import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  DataFeedsContext,
  DataFeedsContextStateType,
  NullableDataFeedsContextStateType,
} from '../dataFeeds.provider.types'
import { EMPTY_DATA_FEEDS_CTX } from './feeds.consts'

type DataFeedsContextReturnValueArgs = {
  feedsCtxState: NullableDataFeedsContextStateType
  isInitialLoading: boolean
  updateFeedsHistoryAndVolatility: DataFeedsContext['updateFeedsHistoryAndVolatility']
}

export const getDataFeedsProviderReturnValue = ({
  feedsCtxState,
  isInitialLoading,
  updateFeedsHistoryAndVolatility,
}: DataFeedsContextReturnValueArgs) => {
  //   const {} = feedsCtxState

  const commonToReturn = {
    updateFeedsHistoryAndVolatility,
  }

  const isLoading = isInitialLoading

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...EMPTY_DATA_FEEDS_CTX,
      ...commonToReturn,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<DataFeedsContextStateType>(
    feedsCtxState,
    EMPTY_DATA_FEEDS_CTX,
  )

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
