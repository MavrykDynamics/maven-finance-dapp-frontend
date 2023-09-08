import { ApolloError } from '@apollo/client'
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'

// helpers

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { useUserContext } from 'providers/UserProvider/user.provider'
import {
  BG_COUNCIL_ACTIONS_DATA,
  BREAK_GLASS_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  DEFAULT_COUNCIL_CTX,
} from './helpers/council.consts'
import { CouncilContext, CouncilSubsRecordType, NullableCouncilContextStateType } from './council.provider.types'
import { getCouncilProviderReturnValue } from './helpers/council.utils'
import { BREAK_GLASS_COUNCIL_MEMBERS_QUERY, getBreakGlassCouncilActions } from './queries/breakGlassCouncil.query'
import { COUNCIL_MEMBERS_QUERY, getCouncilActions } from './queries/council.query'
import dayjs from 'dayjs'
import {
  GetBreakGlassCouncilActionsQuery,
  GetBreakGlassCouncilMembersQuery,
  GetCouncilActionsQuery,
  GetCouncilMembersQuery,
} from 'utils/__generated__/graphql'
import { normalizeCouncilActions, normalizeCouncilMembers } from './helpers/council.normalizer'

export const councilContext = React.createContext<CouncilContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const CouncilProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const [councilCtxState, setCouncilCtxState] = useState<NullableCouncilContextStateType>(DEFAULT_COUNCIL_CTX)
  const [activeSubs, setActiveSubs] = useState<CouncilSubsRecordType>(DEFAULT_COUNCIL_ACTIVE_SUBS)

  const currentTimeRef = useRef(dayjs().toISOString())

  const refetchQueryVariables = useCallback(
    () => ({
      currentTimestamp: dayjs().toISOString(),
    }),
    [currentTimeRef.current], // to have up-to-date query data after some indexer block update, DO NOT REMOVE from deps
  )

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes

  // MEMBERS SUBS ----------------------------------------
  // council
  useQueryWithRefetch(COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => {
      updateCouncilMembers(data)
    },
    onError: (error) => handleSubError(error, COUNCIL_MEMBERS_SUB),
  })

  // break glass
  useQueryWithRefetch(BREAK_GLASS_COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[BREAK_GLASS_COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => {
      updateBreakGlassCouncilMembers(data)
    },
    onError: (error) => handleSubError(error, COUNCIL_MEMBERS_SUB),
  })

  // ACTIONS SUBS ----------------------------------------
  // break glass
  useQueryWithRefetch(
    getBreakGlassCouncilActions(activeSubs[BG_COUNCIL_ACTIONS_DATA]),
    {
      skip: activeSubs[BG_COUNCIL_ACTIONS_DATA] === null,
      onCompleted: (data) => {
        updateBreakGlassCouncilActionsData(data)
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress,
      },
      onError: (error) => handleSubError(error, 'getBreakGlassCouncilActions query error'),
    },
    { refetchQueryVariables },
  )

  // council
  useQueryWithRefetch(
    getCouncilActions(activeSubs[COUNCIL_ACTIONS_DATA]),
    {
      skip: activeSubs[COUNCIL_ACTIONS_DATA] === null,
      onCompleted: (data) => {
        updateCouncilActionsData(data)
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress,
      },
      onError: (error) => handleSubError(error, 'getCouncilActions query error'),
    },
    { refetchQueryVariables },
  )

  // methods to update data ----------------------------------------

  // actions update
  const updateCouncilActionsData = (data: GetCouncilActionsQuery) => {
    const { myPastActions, myPendingActions, notMyPendingActions, allPastActions, allPendingActions, actionsMapper } =
      normalizeCouncilActions(data.council_action, userAddress, activeSubs[COUNCIL_ACTIONS_DATA])

    // TODO compare prev data is it's not empty to don't show the loader
    setCouncilCtxState((prev) => ({
      ...prev,
      councilActions: {
        myPastActions,
        myPendingActions,
        notMyPendingActions,
        allPastActions,
        allPendingActions,
        actionsMapper,
      },
    }))
  }

  const updateBreakGlassCouncilActionsData = (data: GetBreakGlassCouncilActionsQuery) => {
    const { myPastActions, myPendingActions, notMyPendingActions, allPastActions, allPendingActions, actionsMapper } =
      normalizeCouncilActions(data.break_glass_action, userAddress, activeSubs[BG_COUNCIL_ACTIONS_DATA])

    // TODO compare prev data is it's not empty to don't show the loader
    setCouncilCtxState((prev) => ({
      ...prev,
      breakGlassCouncilActions: {
        myPastActions,
        myPendingActions,
        notMyPendingActions,
        allPastActions,
        allPendingActions,
        actionsMapper,
      },
    }))
  }

  // members update

  const updateCouncilMembers = (data: GetCouncilMembersQuery) => {
    if (!data.council[0]?.members) return
    const members = normalizeCouncilMembers(data.council[0].members)

    setCouncilCtxState((prev) => ({
      ...prev,
      councilMembers: members,
    }))
  }

  const updateBreakGlassCouncilMembers = (data: GetBreakGlassCouncilMembersQuery) => {
    if (!data.break_glass_council_member) return
    const members = normalizeCouncilMembers(data.break_glass_council_member)

    setCouncilCtxState((prev) => ({
      ...prev,
      breakGlassCouncilMembers: members,
    }))
  }

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
