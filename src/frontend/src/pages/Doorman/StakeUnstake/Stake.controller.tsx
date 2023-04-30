import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { gql, useSubscription } from '@apollo/client'

// helpers
import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { normalizeSmvkHistoryData } from '../Doorman.converter'

// types
import { AppDispatch } from 'app/App.controller'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { UserState } from 'reducers/wallet'

// actions
import { UPDATE_DOORMAN_STORAGE } from '../Doorman.actions'

// for doorman -> pass to normalizeSmvkHistoryData
const SUBSCRIPTION_STAKE = gql`
  subscription subscribeSmvkHistoryData {
    smvk_history_data(distinct_on: timestamp) {
      mvk_total_supply
      smvk_total_supply
      timestamp
    }
  }
`

// for address
const ADDRESS_BALANCE_DATA = gql`
  subscription subscribeAdressBalance($_eq: String) {
    mavryk_user(where: { address: { _eq: $_eq } }) {
      address
      mvk_balance
      smvk_balance
    }
  }
`
// for doorman normalizeDoormanStorage
const DOORMAN_ADDRESS_BALANCE = gql`
  subscription subscribeDoormanAddressBalance($doormanContractAddress: String) {
    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {
      mvk_balance
    }
  }
`

// update actions
function updateUserStakeData(dispatch: AppDispatch, prevUserData: UserState, userData: any, accountPkh: string) {
  try {
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

    // hide toaster ?
  } catch (e) {
    throw e
  }
}

function updateDoormanStakeHistoryData(dispatch: AppDispatch, smvkStorage: any) {
  const { smvkHistoryData, mvkHistoryData } = normalizeSmvkHistoryData(smvkStorage)

  dispatch({
    type: UPDATE_DOORMAN_STORAGE,
    payload: {
      mvkHistoryData,
      smvkHistoryData,
    },
  })
}
function updateDoormanStorageData(dispatch: AppDispatch, storage: any) {
  const totalStakedMvk = calcWithoutPrecision(storage.mavryk_user[0].mvk_balance ?? 0)

  dispatch({
    type: UPDATE_DOORMAN_STORAGE,
    payload: { totalStakedMvk },
  })
}

export const StakeController = ({ children }: { children: React.ReactNode }) => {
  const { doormanAddress } = useSelector((state: State) => state.contractAddresses)
  const { accountPkh, user } = useSelector((state: State) => state.wallet)

  const dispatch = useDispatch()

  useSubscription(SUBSCRIPTION_STAKE, {
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) console.error(error)
      // updateDoormanStakeHistoryData(dispatch, data)
      console.log(data, ' SUBSCRIPTION_STAKE (doorman s)')
    },
  })

  useSubscription(ADDRESS_BALANCE_DATA, {
    variables: {
      _eq: accountPkh,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) console.error(error)
      // updateUserStakeData(dispatch, user, data, accountPkh as string)
      console.log(data, 'ADDRESS_BALANCE_DATA (address)')
    },
  })

  useSubscription(DOORMAN_ADDRESS_BALANCE, {
    variables: {
      doormanContractAddress: doormanAddress.address,
    },
    onData: ({ data: result }) => {
      const { data, error } = result
      if (error) console.error(error)
      // updateDoormanStorageData(dispatch, data)
      console.log(data, ' DOORMAN_ADDRESS_BALANCE (doorman d)')
    },
  })
  return <>{children}</>
}
