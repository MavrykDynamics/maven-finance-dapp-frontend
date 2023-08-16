import { ApolloError } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient } from 'utils/calcFunctions'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import {
  DoormanContext,
  NullableDoormanContextStateType,
  DoormanSubsRecordType,
  StakingSubsType,
} from './doorman.provider.types'
import { SmvkMvkHistoryDataQuery, GetDappSmvkMvkStatsQuery } from 'utils/__generated__/graphql'

// consts
import { MVK_DECIMALS } from 'utils/constants'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  DEFAULT_STAKING_CTX,
  MVK_SMVK_HISTORY_SUB,
  DAPP_MVK_SMVK_STATS_SUB,
  DEFAULT_STAKING_ACTIVE_SUBS,
} from './helpers/doorman.consts'
import { SMVK_MVK_HISTORY_DATA, DAPP_MVK_SMVK_STATS } from './queries/doorman.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { getDoormanProviderReturnValue } from './helpers/doorman.utils'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

export const doormanContext = React.createContext<DoormanContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const DoormanProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
  const {
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()

  const [stakingCtxState, setStakingCtxState] = useState<NullableDoormanContextStateType>(DEFAULT_STAKING_CTX)
  const [activeSubs, setActiveSubs] = useState<DoormanSubsRecordType>(DEFAULT_STAKING_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: StakingSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  useQueryWithRefetch(SMVK_MVK_HISTORY_DATA, {
    skip: !activeSubs[MVK_SMVK_HISTORY_SUB],
    onCompleted: (data) => {
      updateStakeHistoryData(data)
    },
    onError: (error) => handleSubError(error, MVK_SMVK_HISTORY_SUB),
  })

  useQueryWithRefetch(DAPP_MVK_SMVK_STATS, {
    skip: !activeSubs[DAPP_MVK_SMVK_STATS_SUB] || !doormanAddress,
    variables: {
      doormanContractAddress: doormanAddress,
    },
    onCompleted: (data) => {
      updateMvkSmvkStats(data)
    },
    onError: (error) => handleSubError(error, DAPP_MVK_SMVK_STATS_SUB),
  })

  // methods to update context data
  const updateStakeHistoryData = ({ smvk_history_data }: SmvkMvkHistoryDataQuery) => {
    const { smvkHistoryData, mvkHistoryData } = normalizeDoormanChartsData({ smvk_history_data })

    setStakingCtxState((prevState) => ({
      ...prevState,
      smvkHistoryData,
      mvkHistoryData,
    }))
  }

  const updateMvkSmvkStats = (storage: GetDappSmvkMvkStatsQuery) => {
    const {
      mavryk_user: [doormanContractBalances],
      mvk_token: [mvkTokenData],
    } = storage
    setStakingCtxState((prevState) => ({
      ...prevState,
      totalStakedMvk: convertNumberForClient({
        number: doormanContractBalances?.mvk_balance ?? 0,
        grade: MVK_DECIMALS,
      }),
      totalSupply: convertNumberForClient({ number: mvkTokenData?.total_supply ?? 0, grade: MVK_DECIMALS }),
      maximumTotalSupply: convertNumberForClient({ number: mvkTokenData?.maximum_supply ?? 0, grade: MVK_DECIMALS }),
    }))
  }

  const changeStakingSubscriptionsList = (newSkips: Partial<DoormanSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getDoormanProviderReturnValue({
        stakingCtxState,
        changeStakingSubscriptionsList,
        activeSubs,
      }),
    [activeSubs, stakingCtxState],
  )

  return <doormanContext.Provider value={contextProviderValue}>{children}</doormanContext.Provider>
}

export const useDoormanContext = () => {
  const context = useContext(doormanContext)

  if (!context) {
    throw new Error('useDoormanContext should be used within DoormanProvider')
  }

  return context
}

export default DoormanProvider
