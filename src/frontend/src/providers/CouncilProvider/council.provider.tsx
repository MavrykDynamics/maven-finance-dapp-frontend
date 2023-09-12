import dayjs from 'dayjs'
import { usePrevious } from 'react-use'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'

// utils
import { normalizeCouncilActions, normalizeCouncilMembers } from './helpers/council.normalizer'
import { getCouncilProviderReturnValue } from './helpers/council.utils'

// hooks
import { useApolloContext } from '../ApolloProvider/apollo.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import { CouncilContext, CouncilSubsRecordType, NullableCouncilContextStateType } from './council.provider.types'
import {
  GetBreakGlassCouncilActionsQuery,
  GetBreakGlassCouncilMembersQuery,
  GetCouncilActionsQuery,
  GetCouncilMembersQuery,
} from 'utils/__generated__/graphql'

// consts
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BG_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  DEFAULT_COUNCIL_CTX,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from './helpers/council.consts'
import { BREAK_GLASS_COUNCIL_MEMBERS_QUERY, getBreakGlassCouncilActions } from './queries/breakGlassCouncil.query'
import { COUNCIL_MEMBERS_QUERY, getCouncilActions } from './queries/council.query'

export const councilContext = React.createContext<CouncilContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const refetchQueryVariables = () => ({
  currentTimestamp: dayjs().toISOString(),
})

const CouncilProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()
  const { userAddress } = useUserContext()

  const currentTimeRef = useRef(dayjs().toISOString())
  const prevUserAddress = usePrevious(userAddress)

  const [councilCtxState, setCouncilCtxState] = useState<NullableCouncilContextStateType>(DEFAULT_COUNCIL_CTX)
  const [activeSubs, setActiveSubs] = useState<CouncilSubsRecordType>(DEFAULT_COUNCIL_ACTIVE_SUBS)

  // update current time when sub that requires it becomes active, to load initial data due to current time, not provider init time
  useEffect(() => {
    if (activeSubs[BG_COUNCIL_ACTIONS_DATA] !== null || activeSubs[COUNCIL_ACTIONS_DATA] !== null) {
      currentTimeRef.current = dayjs().toISOString()
    }
  }, [activeSubs])

  // reset user specific fields on user change
  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setCouncilCtxState((prev) => ({
        ...prev,
        breakGlassCouncilActions: {
          allPendingActions: prev.breakGlassCouncilActions?.allPendingActions ?? null,
          notMyPendingActions: prev.breakGlassCouncilActions?.notMyPendingActions ?? null,
          allPastActions: prev.breakGlassCouncilActions?.allPastActions ?? null,
          actionsMapper: prev.breakGlassCouncilActions?.actionsMapper ?? null,
          myPastActions: DEFAULT_COUNCIL_CTX.breakGlassCouncilActions?.myPastActions ?? null,
          myPendingActions: DEFAULT_COUNCIL_CTX.breakGlassCouncilActions?.myPendingActions ?? null,
        },
        councilActions: {
          allPendingActions: prev.councilActions?.allPendingActions ?? null,
          notMyPendingActions: prev.councilActions?.notMyPendingActions ?? null,
          allPastActions: prev.councilActions?.allPastActions ?? null,
          actionsMapper: prev.councilActions?.actionsMapper ?? null,
          myPastActions: DEFAULT_COUNCIL_CTX.councilActions?.myPastActions ?? null,
          myPendingActions: DEFAULT_COUNCIL_CTX.councilActions?.myPendingActions ?? null,
        },
      }))
    }
  }, [userAddress])

  // council members
  useQueryWithRefetch(COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => updateCouncilMembers(data),
    onError: (error) => handleApolloError(error, 'COUNCIL_MEMBERS_SUB'),
  })

  // council actions
  useQueryWithRefetch(
    getCouncilActions(activeSubs[COUNCIL_ACTIONS_DATA]),
    {
      skip: !activeSubs[COUNCIL_ACTIONS_DATA],
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress,
      },
      onCompleted: (data) => updateCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'getCouncilActions'),
    },
    { refetchQueryVariables },
  )

  // break glass members
  useQueryWithRefetch(BREAK_GLASS_COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[BG_COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => updateBreakGlassCouncilMembers(data),
    onError: (error) => handleApolloError(error, 'COUNCIL_MEMBERS_SUB'),
  })

  // break glass actions
  useQueryWithRefetch(
    getBreakGlassCouncilActions(activeSubs[BG_COUNCIL_ACTIONS_DATA]),
    {
      skip: !activeSubs[BG_COUNCIL_ACTIONS_DATA],
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress,
      },
      onCompleted: (data) => updateBreakGlassCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'getBreakGlassCouncilActions'),
    },
    { refetchQueryVariables },
  )

  // mavryk council actions update
  const updateCouncilActionsData = (data: GetCouncilActionsQuery) => {
    const { myPastActions, myPendingActions, notMyPendingActions, allPastActions, allPendingActions, actionsMapper } =
      normalizeCouncilActions(data.council_action, userAddress)

    const isAllPastActionsSubActive = activeSubs[COUNCIL_ACTIONS_DATA] === ALL_PAST_COUNCIL_ACTIONS_SUB
    const isMyPastActionsSubActive = activeSubs[COUNCIL_ACTIONS_DATA] === MY_PAST_COUNCIL_ACTIONS_SUB
    const isPendingActionsSubActive = activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB

    console.log({
      isAllPastActionsSubActive,
      activeSubs,
      allPastActions,
      currentallPastActions: councilCtxState.councilActions?.allPastActions ?? [],
    })

    setCouncilCtxState((prev) => ({
      ...prev,
      councilActions: {
        allPastActions: isAllPastActionsSubActive ? allPastActions : prev.councilActions?.allPastActions ?? [],
        myPastActions:
          isAllPastActionsSubActive || isMyPastActionsSubActive
            ? myPastActions
            : prev.councilActions?.myPastActions ?? [],
        allPendingActions: isPendingActionsSubActive ? allPendingActions : prev.councilActions?.allPendingActions ?? [],
        notMyPendingActions: isPendingActionsSubActive
          ? notMyPendingActions
          : prev.councilActions?.notMyPendingActions ?? [],
        myPendingActions: isPendingActionsSubActive ? myPendingActions : prev.councilActions?.myPendingActions ?? [],
        actionsMapper: { ...prev.councilActions?.actionsMapper, ...actionsMapper },
      },
    }))
  }

  // break glass council actions update
  const updateBreakGlassCouncilActionsData = (data: GetBreakGlassCouncilActionsQuery) => {
    const { myPastActions, myPendingActions, notMyPendingActions, allPastActions, allPendingActions, actionsMapper } =
      normalizeCouncilActions(data.break_glass_action, userAddress)

    const isAllPastActionsSubActive = activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_PAST_COUNCIL_ACTIONS_SUB
    const isMyPastActionsSubActive = activeSubs[BG_COUNCIL_ACTIONS_DATA] === MY_BG_PAST_COUNCIL_ACTIONS_SUB
    const isPendingActionsSubActive = activeSubs[BG_COUNCIL_ACTIONS_DATA] === ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB

    setCouncilCtxState((prev) => ({
      ...prev,
      breakGlassCouncilActions: {
        allPastActions: isAllPastActionsSubActive
          ? allPastActions
          : prev.breakGlassCouncilActions?.allPastActions ?? [],
        myPastActions:
          isAllPastActionsSubActive || isMyPastActionsSubActive
            ? myPastActions
            : prev.breakGlassCouncilActions?.myPastActions ?? [],
        allPendingActions: isPendingActionsSubActive
          ? allPendingActions
          : prev.breakGlassCouncilActions?.allPendingActions ?? [],
        notMyPendingActions: isPendingActionsSubActive
          ? notMyPendingActions
          : prev.breakGlassCouncilActions?.notMyPendingActions ?? [],
        myPendingActions: isPendingActionsSubActive
          ? myPendingActions
          : prev.breakGlassCouncilActions?.myPendingActions ?? [],
        actionsMapper: { ...prev.breakGlassCouncilActions?.actionsMapper, ...actionsMapper },
      },
    }))
  }

  // mavryk council members update
  const updateCouncilMembers = (data: GetCouncilMembersQuery) => {
    if (!data.council[0]?.members) return
    const members = normalizeCouncilMembers(data.council[0].members)

    setCouncilCtxState((prev) => ({
      ...prev,
      councilMembers: members,
    }))
  }

  // break glass council members update
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

  console.log('useCouncilContext', { councilCtxState, contextProviderValue, activeSubs })

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
