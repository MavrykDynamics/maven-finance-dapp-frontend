import { GET_FEEDS_STORAGE } from 'pages/DataFeeds/DataFeeds.actions'
import { DataFeedsStorageType } from 'utils/TypesAndInterfaces/DataFeeds'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type DataFeedsState = DataFeedsStorageType & { isLoaded: boolean }

const dataFeedsDefaultState: DataFeedsState = {
  feedsLedger: [],
  feedCategories: [],
  isLoaded: false,
}

export function dataFeeds(state = dataFeedsDefaultState, action: Action) {
  switch (action.type) {
    case GET_FEEDS_STORAGE:
      return {
        ...state,
        ...action.normalizedFeedsStorage,
        isLoaded: true,
      }
    default:
      return state
  }
}
