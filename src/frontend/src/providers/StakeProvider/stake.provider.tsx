import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient } from 'utils/calcFunctions'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
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
import { MVK_DECIMALS } from 'utils/constants'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  DEFAULT_STAKING_CTX,
  MVK_BALANCE_SUB,
  MVK_TOTAL_SUB,
  DEFAULT_STAKING_ACTIVE_SUBS,
  SMVK_HISTORY_SUB,
} from './helpers/stake.consts'
import {
  SUBSCRIPTION_STAKE_HISTORY,
  SUBSCRIPTION_ADDRESS_BALANCE_DATA,
  SUBSCRIPTION_MVK_TOKEN_TOTAL,
} from './queries/doorman.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

export const stakeContext = React.createContext<StakeContext>(undefined!)

const StakeProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
  const {
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()

  const [stakingCtxState, setStakingCtxState] = useState<StakeContextStateType>(DEFAULT_STAKING_CTX)
  const [activeSubs, setActiveSubs] = useState<StakingSubsRecordType>(DEFAULT_STAKING_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: StakingSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  const { loading: isStakingHistoryLoading } = useSubscription(SUBSCRIPTION_STAKE_HISTORY, {
    skip: !activeSubs[SMVK_HISTORY_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateStakeHistoryData(data)
    },
    onError: (error) => handleSubError(error, SMVK_HISTORY_SUB),
  })

  const { loading: isMvkBalanceLoading } = useSubscription(SUBSCRIPTION_ADDRESS_BALANCE_DATA, {
    skip: !activeSubs[MVK_BALANCE_SUB] || !doormanAddress,
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
    skip: !activeSubs[MVK_TOTAL_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateTotalMvkToken(data)
    },
    onError: (error) => handleSubError(error, MVK_TOTAL_SUB),
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

  const changeStakingSubscriptionsList = (newSkips: Partial<StakingSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(() => {
    return {
      ...stakingCtxState,
      isLoading: isStakingHistoryLoading || isMvkBalanceLoading || isMvkTotalLoading,
      changeStakingSubscriptionsList,
    }
  }, [isMvkBalanceLoading, isMvkTotalLoading, isStakingHistoryLoading, stakingCtxState])

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
