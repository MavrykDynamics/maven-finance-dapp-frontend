import { ApolloError } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'

// helpers

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { DEFAULT_COUNCIL_ACTIVE_SUBS, DEFAULT_COUNCIL_CTX } from './helpers/council.consts'
import { CouncilContext, CouncilSubsRecordType, NullableCouncilContextStateType } from './council.provider.types'

export const councilContext = React.createContext<CouncilContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const CouncilProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const [councilCtxState, setCouncilCtxState] = useState<NullableCouncilContextStateType>(DEFAULT_COUNCIL_CTX)
  const [activeSubs, setActiveSubs] = useState<CouncilSubsRecordType>(DEFAULT_COUNCIL_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  //   useQueryWithRefetch(DAPP_MVK_SMVK_STATS, {
  //     skip: !activeSubs[DAPP_MVK_SMVK_STATS_SUB] || !doormanAddress,
  //     variables: {
  //       doormanContractAddress: doormanAddress,
  //     },
  //     onCompleted: (data) => {
  //       updateMvkSmvkStats(data)
  //     },
  //     onError: (error) => handleSubError(error, DAPP_MVK_SMVK_STATS_SUB),
  //   })

  const changeCouncilSubscriptionList = (newSubs: Partial<CouncilSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSubs }))
  }

  const contextProviderValue = useMemo(
    () =>
      getCouncilProviderReturnValue({
        councilCtxState,
        changeCouncilSubscriptionList,
        activeSubs,
      }),
    [activeSubs, councilCtxState],
  )

  return <councilContext.Provider value={contextProviderValue}>{children}</councilContext.Provider>
}

export const useCouncilContext = () => {
  const context = useContext(councilContext)

  if (!context) {
    throw new Error('useCouncilContext should be used within CouncilProvider')
  }

  return context
}

export default CouncilProvider
