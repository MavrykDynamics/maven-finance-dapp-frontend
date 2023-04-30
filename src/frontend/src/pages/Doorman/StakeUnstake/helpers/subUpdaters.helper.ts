import { calcWithoutPrecision } from 'utils/calcFunctions'
import { normalizeSmvkHistoryData } from '../../Doorman.converter'

// types
import { AppDispatch } from 'app/App.controller'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { UserState } from 'reducers/wallet'
import {
  SubscribeSmvkHistoryDataSubscription,
  SubscribeAdressBalanceSubscription,
  SubscribeDoormanAddressBalanceSubscription,
} from 'utils/__generated__/graphql'

// action types
import { UPDATE_DOORMAN_STORAGE } from '../../Doorman.actions'

// ------------------------------------------
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  TOASTER_SUCCESS,
  TOASTER_ERROR,
  ERROR,
} from 'app/App.components/Toaster/Toaster.constants'
import { toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

// toaster actionS
export function showStakeSuccessMessage(dispatch: AppDispatch, message: string) {
  dispatch(hideToaster())
  dispatch(showToaster(TOASTER_SUCCESS, `${message} done`, ACTION_COMPLETION_MESSAGE_TEXT))
  dispatch(toggleActionCompletion(false))
}

export function showStakeErrorMessage(dispatch: AppDispatch, message: string) {
  dispatch(hideToaster())
  dispatch(showToaster(TOASTER_ERROR, message, ERROR))
  dispatch(toggleActionCompletion(false))
}

// update actions
export function updateUserStakeData(
  dispatch: AppDispatch,
  prevUserData: UserState,
  userData: SubscribeAdressBalanceSubscription,
  accountPkh: string,
) {
  const { mvk_balance = 0, smvk_balance = 0 } = userData.mavryk_user[0]

  dispatch({
    type: UPDATE_USER_DATA,
    userData: {
      ...prevUserData,
      myMvkTokenBalance: calcWithoutPrecision(mvk_balance),
      mySMvkTokenBalance: calcWithoutPrecision(smvk_balance),
    },
    accountPkh,
  })
}

export function updateDoormanStakeHistoryData(
  dispatch: AppDispatch,
  smvkStorage: SubscribeSmvkHistoryDataSubscription,
) {
  const { smvk_history_data } = smvkStorage
  // TODO fix types for normalizer to take them from __generated__ to avoid ts errors
  const { smvkHistoryData, mvkHistoryData } = normalizeSmvkHistoryData({ smvk_history_data } as any)

  dispatch({
    type: UPDATE_DOORMAN_STORAGE,
    payload: {
      mvkHistoryData,
      smvkHistoryData,
    },
  })
}

export function updateDoormanStorageData(dispatch: AppDispatch, storage: SubscribeDoormanAddressBalanceSubscription) {
  const totalStakedMvk = calcWithoutPrecision(storage.mavryk_user[0].mvk_balance ?? 0)

  dispatch({
    type: UPDATE_DOORMAN_STORAGE,
    payload: { totalStakedMvk },
  })
}
