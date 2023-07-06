import React, { useContext, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient } from 'utils/calcFunctions'

// providers
import { ApolloError, useSubscription } from '@apollo/client'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import {
  Props,
  StakeContext,
  StakeContextStateType,
  StakingSubsRecordType,
  StakingSubsType,
} from './stake.provider.types'
import {
  SubscribeSmvkHistoryDataSubscription,
  SubscribeMvkTokenTotalSubscription,
  SubscribeAdressBalanceSubscription,
} from 'utils/__generated__/graphql'

// consts
import { MVK_DECIMALS, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  DEFAULT_STAKING_CTX,
  MVK_BALANCE_SUB,
  MVK_TOTAL_SUB,
  DEFAULT_STAKING_SUBS,
  SMVK_HISTORY_SUB,
} from './helpers/stake.consts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import {
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
  SUBSCRIPTION_STAKE_HISTORY,
} from 'gql/subscriptions/stakingData'

// TODO: remove after user balances live update is ready
import { State as ReduxState } from 'reducers'

export const stakeContext = React.createContext<StakeContext>(undefined!)

const StakeProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  // TODO: remove after user balances live update is ready
  const dispatch = useDispatch()
  const { accountPkh, user } = useSelector((state: ReduxState) => state.wallet)
  // TODO: move to context
  const {
    doormanAddress: { address: doormanAddress },
  } = useSelector((state: ReduxState) => state.contractAddresses)

  const [stakingCtxState, setStakingCtxState] = useState<StakeContextStateType>(DEFAULT_STAKING_CTX)
  const [shouldSkip, setShouldSkip] = useState<StakingSubsRecordType>(DEFAULT_STAKING_SUBS)

  const handleSubError = (error: ApolloError, subName: StakingSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  const { loading: isStakingHistoryLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: shouldSkip[SMVK_HISTORY_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateStakeHistoryData(data)
    },
    onError: (error) => handleSubError(error, SMVK_HISTORY_SUB),
  })

  const { loading: isMvkBalanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip[MVK_BALANCE_SUB],
    variables: {
      _eq: doormanAddress,
    },
    onData: ({ data: { data } }) => {
      if (!data) return
      updateTotalStakedMvk(data)
    },
    onError: (error) => handleSubError(error, MVK_BALANCE_SUB),
    shouldResubscribe: true,
  })

  const { loading: isMvkTotalLoading } = useSubscription(SUBSCRIPTION_MVK_TOKEN_TOTAL, {
    skip: shouldSkip[MVK_TOTAL_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateTotalMvkToken(data)
    },
    onError: (error) => handleSubError(error, MVK_TOTAL_SUB),
    shouldResubscribe: true,
  })

  // TODO: remove after user balances live update is ready
  const { loading: isUserBalanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: shouldSkip.userBalance,
    variables: {
      _eq: accountPkh,
    },
    onData: ({ data: { data } }) => {
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
    },
    onError: (error) => handleSubError(error, 'userBalance'),
    shouldResubscribe: true,
  })

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

  const contextProviderValue = useMemo(() => {
    const changeStakingSubscriptionsList = (newSkips: Partial<StakingSubsRecordType>) =>
      setShouldSkip((prev) => ({ ...prev, ...newSkips }))
    return {
      ...stakingCtxState,
      isLoading: isStakingHistoryLoading || isMvkBalanceLoading || isMvkTotalLoading || isUserBalanceLoading,
      changeStakingSubscriptionsList,
    }
  }, [isMvkBalanceLoading, isMvkTotalLoading, isStakingHistoryLoading, isUserBalanceLoading, stakingCtxState])

  return <stakeContext.Provider value={contextProviderValue}>{children}</stakeContext.Provider>
}

export const useStakeContext = () => {
  const context = useContext(stakeContext)

  if (!context) {
    throw new Error('StakeContext should be used withing StakeProvider')
  }

  return context
}

export default StakeProvider
