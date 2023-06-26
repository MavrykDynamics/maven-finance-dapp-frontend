import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient, convertNumberForContractCall } from 'utils/calcFunctions'
import { unknownToError } from 'errors/error'

// providers
import { useSubscription } from '@apollo/client'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import {
  Props,
  StakeContext,
  StakeContextStateType,
  StakingActionData,
  StakingSubsLoadingsType,
  StakingSubsSkipsType,
} from './stake.provider.types'
import {
  SubscribeSmvkHistoryDataSubscription,
  SubscribeMvkTokenTotalSubscription,
  SubscribeAdressBalanceSubscription,
} from 'utils/__generated__/graphql'

// consts
import { MVK_DECIMALS, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import {
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
  SUBSCRIPTION_STAKE_HISTORY,
} from 'gql/subscriptions/stakingData'

// helpers
import { getInitialLoadingStateForFiredAction, needOffStakeAction } from './helpers/stake.consts'
import { sleep } from 'utils/api/sleep'

// TODO: remove after user balances live update is ready
import { State as ReduxState } from 'reducers'

export const stakeContext = React.createContext<StakeContext>(undefined!)

const StakeProvider = ({ children }: Props) => {
  const { bug, hideToasterMessage, success } = useToasterContext()

  // TODO: remove after user balances live update is ready
  const dispatch = useDispatch()
  const { accountPkh, user } = useSelector((state: ReduxState) => state.wallet)
  // TODO: move to context
  const {
    doormanAddress: { address: doormanAddress },
  } = useSelector((state: ReduxState) => state.contractAddresses)

  const [stakingCtxState, setStakingCtxState] = useState<StakeContextStateType>({
    totalStakedMvk: 0,
    totalSupply: 0,
    maximumTotalSupply: 0,
    mvkHistoryData: [],
    smvkHistoryData: [],
  })

  const [shouldSkip, setShouldSkip] = useState<StakingSubsSkipsType>({
    skipAddressBalance: SUB_SUBSCRIBE,
    skipMvkTokenTotal: SUB_SUBSCRIBE,
    skipStakeHistory: SUB_SUBSCRIBE,
    skipUserBalance: SUB_SUBSCRIBE,
  })

  const [queryLoadings, setQueryLoadings] = useState<StakingSubsLoadingsType>({
    addressBalance: false,
    mvkTokenTotal: false,
    stakeHistory: false,
    userBalance: false,
  })
  const [stakingActionData, setStakingActionData] = useState<StakingActionData>({
    loadingToasterId: null,
    action: '',
  })

  // subscribes
  const { loading: isStakingHistoryLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip.skipStakeHistory === SUB_SKIP,
    onData: async ({ data: { data } }) => {
      if (!data) return
      updateStakeHistoryData(data)
      setQueryLoadings((prev) => ({ ...prev, stakeHistory: false }))

      if (shouldSkip.skipStakeHistory === SUB_QUERY) setShouldSkip((prev) => ({ ...prev, skipStakeHistory: SUB_SKIP }))
    },
    onError: (error) => {
      console.error('SUBSCRIPTION_STAKE_HISTORY query error: ', error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  const { loading: isMvkStatsLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip.skipAddressBalance === SUB_SKIP,
    variables: {
      _eq: doormanAddress,
    },
    onData: async ({ data: { data } }) => {
      if (!data) return
      updateTotalStakedMvk(data)
      setQueryLoadings((prev) => ({ ...prev, addressBalance: false }))

      if (shouldSkip.skipAddressBalance === SUB_QUERY)
        setShouldSkip((prev) => ({ ...prev, skipAddressBalance: SUB_SKIP }))
    },
    onError: (error) => {
      console.error('SUBSCRIPTION_ADDRESS_BALANCE_DATA query error: ', error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
    shouldResubscribe: true,
  })

  const { loading: isMvkTotalLoading } = useSubscription(SUBSCRIPTION_MVK_TOKEN_TOTAL, {
    skip: shouldSkip.skipMvkTokenTotal === SUB_SKIP,
    onData: async ({ data: { data } }) => {
      if (!data) return
      updateTotalMvkToken(data)
      setQueryLoadings((prev) => ({ ...prev, mvkTokenTotal: false }))

      if (shouldSkip.skipMvkTokenTotal === SUB_QUERY)
        setShouldSkip((prev) => ({ ...prev, skipMvkTokenTotal: SUB_SKIP }))
    },
    onError: (error) => {
      console.error('SUBSCRIPTION_MVK_TOKEN_TOTAL query error: ', error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
    shouldResubscribe: true,
  })

  // TODO: remove after user balances live update is ready
  const { loading: isUserBalanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip.skipUserBalance === SUB_SKIP,
    variables: {
      _eq: accountPkh,
    },
    onData: async ({ data: { data } }) => {
      if (!data) return

      const { mvk_balance = 0, smvk_balance = 0 } = data.mavryk_user[0]

      dispatch({
        type: UPDATE_USER_DATA,
        userData: {
          ...user,
          userTokens: {
            ...user.userTokens,
            [MVK_TOKEN_SYMBOL]: {
              ...user.userTokens[MVK_TOKEN_SYMBOL],
              balance: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }),
            },
            [SMVK_TOKEN_SYMBOL]: {
              ...user.userTokens[SMVK_TOKEN_SYMBOL],
              balance: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
            },
          },
        },
        accountPkh,
      })

      setQueryLoadings((prev) => ({ ...prev, userBalance: false }))

      if (shouldSkip.skipUserBalance === SUB_QUERY) setShouldSkip((prev) => ({ ...prev, skipUserBalance: SUB_SKIP }))
    },
    onError: (error) => {
      console.error('SUBSCRIPTION_ADDRESS_BALANCE_DATA query error: ', error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
    shouldResubscribe: true,
  })

  useEffect(() => {
    const turnOffAction = async () => {
      if (stakingActionData.action && stakingActionData.loadingToasterId) {
        hideToasterMessage(stakingActionData.loadingToasterId)
        await sleep(300)
        success(
          TOASTER_ACTIONS_TEXTS[stakingActionData.action]['end']['message'],
          TOASTER_ACTIONS_TEXTS[stakingActionData.action]['end']['title'],
        )

        updateStakeActionData(null)
      }
    }

    if (needOffStakeAction(queryLoadings, stakingActionData)) turnOffAction()
  }, [queryLoadings, stakingActionData])

  const updateStakeActionData: StakeContext['updateStakeActionData'] = (actionData) => {
    if (!actionData) {
      setStakingActionData({
        loadingToasterId: null,
        action: '',
      })
      return
    }

    if (actionData.action) {
      setQueryLoadings(getInitialLoadingStateForFiredAction(actionData.action))
    }

    setStakingActionData((prev) => ({ ...prev, ...actionData }))
  }

  // methods to update context data
  const updateStakeHistoryData = ({ smvk_history_data }: SubscribeSmvkHistoryDataSubscription) => {
    const { smvkHistoryData, mvkHistoryData } = normalizeDoormanChartsData({ smvk_history_data })

    setStakingCtxState((prevState) => ({
      ...prevState,
      smvkHistoryData,
      mvkHistoryData,
    }))
  }

  const updateTotalStakedMvk = (storage: SubscribeAdressBalanceSubscription) => {
    setStakingCtxState((prevState) => ({
      ...prevState,
      totalStakedMvk: convertNumberForClient({
        number: storage.mavryk_user[0].mvk_balance ?? 0,
        grade: MVK_DECIMALS,
      }),
    }))
  }

  const updateTotalMvkToken = ({ mvk_token: [mvkTokenItem] }: SubscribeMvkTokenTotalSubscription) => {
    setStakingCtxState((prevState) => ({
      ...prevState,
      totalSupply: convertNumberForClient({ number: mvkTokenItem.total_supply ?? 0, grade: MVK_DECIMALS }),
      maximumTotalSupply: convertNumberForClient({ number: mvkTokenItem.maximum_supply ?? 0, grade: MVK_DECIMALS }),
    }))
  }

  // staking page actions
  const stakeMVK: StakeContext['stakeMVK'] = async (amount, accountPkh, doormanAddress, mvkTokenAddress) => {
    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const mvkTokenContract = await tezos?.wallet.at(mvkTokenAddress)
      const doormanContract = await tezos?.wallet.at(doormanAddress)

      const addOperators = [
          {
            add_operator: {
              owner: accountPkh,
              operator: doormanAddress,
              token_id: 0,
            },
          },
        ],
        removeOperators = [
          {
            remove_operator: {
              owner: accountPkh,
              operator: doormanAddress,
              token_id: 0,
            },
          },
        ]

      const batch =
        mvkTokenContract &&
        doormanContract &&
        (await tezos.wallet
          .batch()
          .withContractCall(mvkTokenContract.methods.update_operators(addOperators))
          .withContractCall(doormanContract.methods.stake(convertNumberForContractCall({ number: amount })))
          .withContractCall(mvkTokenContract.methods.update_operators(removeOperators)))
      await batch?.send()

      return { actionSuccess: true, error: null }
    } catch (error) {
      return { actionSuccess: false, error: unknownToError(error) }
    }
  }

  const unstakeMVK: StakeContext['unstakeMVK'] = async (amount, doormanAddress) => {
    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(doormanAddress)
      await contract?.methods.unstake(convertNumberForContractCall({ number: amount })).send()

      return { actionSuccess: true, error: null }
    } catch (error) {
      return { actionSuccess: false, error: unknownToError(error) }
    }
  }

  return (
    <stakeContext.Provider
      value={{
        ...stakingCtxState,
        isLoading: isStakingHistoryLoading || isMvkStatsLoading || isMvkTotalLoading || isUserBalanceLoading,
        updateStakeActionData,
        changeStakingSubscriptionType: setShouldSkip,
        stakeMVK,
        unstakeMVK,
      }}
    >
      {children}
    </stakeContext.Provider>
  )
}

export const useStakeContext = () => {
  const context = useContext(stakeContext)

  if (!context) {
    throw new Error('StakeContext should be used withing StakeProvider')
  }

  return context
}

export default StakeProvider
