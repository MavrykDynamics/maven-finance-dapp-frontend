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
import {
  CouncilContext,
  CouncilSubsRecordType,
  NullableCouncilContextStateType,
  CounsilActionsQueryType,
  BgCounsilActionsQueryType,
} from './council.provider.types'
import { GetBreakGlassCouncilMembersQuery, GetCouncilMembersQuery } from 'utils/__generated__/graphql'

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
import {
  ALL_BG_ONGOING_COUNSILS_QUERY,
  ALL_BG_PAST_COUNSILS_QUERY,
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY,
  MY_BG_PAST_COUNSILS_QUERY,
} from './queries/breakGlassCouncil.query'
import {
  COUNCIL_MEMBERS_QUERY,
  ALL_ONGOING_COUNSILS_QUERY,
  ALL_PAST_COUNSILS_QUERY,
  MY_PAST_COUNSILS_QUERY,
} from './queries/council.query'

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
          actionsMapper: prev.breakGlassCouncilActions?.actionsMapper ?? null,
          allPendingActions: prev.breakGlassCouncilActions?.allPendingActions ?? null,
          allPastActions: prev.breakGlassCouncilActions?.allPastActions ?? null,
          notMyPendingActions: DEFAULT_COUNCIL_CTX.breakGlassCouncilActions?.notMyPendingActions ?? null,
          myPastActions: DEFAULT_COUNCIL_CTX.breakGlassCouncilActions?.myPastActions ?? null,
          myPendingActions: DEFAULT_COUNCIL_CTX.breakGlassCouncilActions?.myPendingActions ?? null,
        },
        councilActions: {
          actionsMapper: prev.councilActions?.actionsMapper ?? null,
          allPendingActions: prev.councilActions?.allPendingActions ?? null,
          allPastActions: prev.councilActions?.allPastActions ?? null,
          notMyPendingActions: DEFAULT_COUNCIL_CTX.councilActions?.notMyPendingActions ?? null,
          myPastActions: DEFAULT_COUNCIL_CTX.councilActions?.myPastActions ?? null,
          myPendingActions: DEFAULT_COUNCIL_CTX.councilActions?.myPendingActions ?? null,
        },
      }))
    }
  }, [userAddress])

  /**
   * councils memebers:
   * COUNCIL_MEMBERS_QUERY -> members of mavryk council
   * BREAK_GLASS_COUNCIL_MEMBERS_QUERY -> members of break glass council
   */
  useQueryWithRefetch(COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => updateCouncilMembers(data),
    onError: (error) => handleApolloError(error, 'COUNCIL_MEMBERS_QUERY'),
  })

  useQueryWithRefetch(BREAK_GLASS_COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[BG_COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => updateBreakGlassCouncilMembers(data),
    onError: (error) => handleApolloError(error, 'BREAK_GLASS_COUNCIL_MEMBERS_QUERY'),
  })

  /**
   * mavryk council actions:
   * ALL_PAST_COUNSILS_QUERY -> expired or executed actions
   * MY_PAST_COUNSILS_QUERY -> expired or executed actions where user is initiator and all ongoing actions,
   *    where user is not initiator (actions to sign carousel)
   * ALL_ONGOING_COUNSILS_QUERY -> all actions that are not executed nor expired
   */
  useQueryWithRefetch(
    ALL_PAST_COUNSILS_QUERY,
    {
      skip: activeSubs[COUNCIL_ACTIONS_DATA] !== ALL_PAST_COUNCIL_ACTIONS_SUB,
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onCompleted: (data) => updateCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'ALL_PAST_COUNSILS_QUERY'),
    },
    { refetchQueryVariables },
  )

  useQueryWithRefetch(
    MY_PAST_COUNSILS_QUERY,
    {
      skip: activeSubs[COUNCIL_ACTIONS_DATA] !== MY_PAST_COUNCIL_ACTIONS_SUB,
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress,
      },
      onCompleted: (data) => updateCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'MY_PAST_COUNSILS_QUERY'),
    },
    { refetchQueryVariables },
  )

  useQueryWithRefetch(
    ALL_ONGOING_COUNSILS_QUERY,
    {
      skip: activeSubs[COUNCIL_ACTIONS_DATA] !== ALL_ONGOING_COUNCIL_ACTIONS_SUB,
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onCompleted: (data) => updateCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'ALL_ONGOING_COUNSILS_QUERY'),
    },
    { refetchQueryVariables },
  )

  /**
   * break glass council actions:
   * ALL_BG_PAST_COUNSILS_QUERY -> expired or executed actions
   * MY_BG_PAST_COUNSILS_QUERY -> expired or executed actions where user is initiator and all ongoing actions,
   *    where user is not initiator (actions to sign carousel)
   * ALL_BG_ONGOING_COUNSILS_QUERY -> all actions that are not executed nor expired
   */
  useQueryWithRefetch(
    ALL_BG_PAST_COUNSILS_QUERY,
    {
      skip: activeSubs[BG_COUNCIL_ACTIONS_DATA] !== ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onCompleted: (data) => updateBreakGlassCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'ALL_BG_PAST_COUNSILS_QUERY'),
    },
    { refetchQueryVariables },
  )

  useQueryWithRefetch(
    MY_BG_PAST_COUNSILS_QUERY,
    {
      skip: activeSubs[BG_COUNCIL_ACTIONS_DATA] !== MY_BG_PAST_COUNCIL_ACTIONS_SUB,
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress,
      },
      onCompleted: (data) => updateBreakGlassCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'MY_BG_PAST_COUNSILS_QUERY'),
    },
    { refetchQueryVariables },
  )

  useQueryWithRefetch(
    ALL_BG_ONGOING_COUNSILS_QUERY,
    {
      skip: activeSubs[BG_COUNCIL_ACTIONS_DATA] !== ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onCompleted: (data) => updateBreakGlassCouncilActionsData(data),
      onError: (error) => handleApolloError(error, 'ALL_BG_ONGOING_COUNSILS_QUERY'),
    },
    { refetchQueryVariables },
  )

  // mavryk council actions update
  const updateCouncilActionsData = (data: CounsilActionsQueryType) => {
    const { myPastActions, myPendingActions, notMyPendingActions, allPastActions, allPendingActions, actionsMapper } =
      normalizeCouncilActions(data.council_action, userAddress)

    const isAllPastActionsSubActive = activeSubs[COUNCIL_ACTIONS_DATA] === ALL_PAST_COUNCIL_ACTIONS_SUB
    const isMyPastActionsSubActive = activeSubs[COUNCIL_ACTIONS_DATA] === MY_PAST_COUNCIL_ACTIONS_SUB
    const isPendingActionsSubActive = activeSubs[COUNCIL_ACTIONS_DATA] === ALL_ONGOING_COUNCIL_ACTIONS_SUB

    setCouncilCtxState((prev) => ({
      ...prev,
      councilActions: {
        allPastActions: isAllPastActionsSubActive ? allPastActions : prev.councilActions?.allPastActions ?? null,
        myPastActions:
          isAllPastActionsSubActive || isMyPastActionsSubActive
            ? myPastActions
            : prev.councilActions?.myPastActions ?? null,
        allPendingActions: isPendingActionsSubActive
          ? allPendingActions
          : prev.councilActions?.allPendingActions ?? null,
        notMyPendingActions:
          isPendingActionsSubActive || isMyPastActionsSubActive
            ? notMyPendingActions
            : prev.councilActions?.notMyPendingActions ?? null,
        myPendingActions: isPendingActionsSubActive ? myPendingActions : prev.councilActions?.myPendingActions ?? null,
        actionsMapper: { ...prev.councilActions?.actionsMapper, ...actionsMapper },
      },
    }))
  }

  // break glass council actions update
  const updateBreakGlassCouncilActionsData = (data: BgCounsilActionsQueryType) => {
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
          : prev.breakGlassCouncilActions?.allPastActions ?? null,
        myPastActions:
          isAllPastActionsSubActive || isMyPastActionsSubActive
            ? myPastActions
            : prev.breakGlassCouncilActions?.myPastActions ?? null,
        allPendingActions: isPendingActionsSubActive
          ? allPendingActions
          : prev.breakGlassCouncilActions?.allPendingActions ?? null,
        notMyPendingActions:
          isPendingActionsSubActive || isMyPastActionsSubActive
            ? notMyPendingActions
            : prev.breakGlassCouncilActions?.notMyPendingActions ?? null,
        myPendingActions: isPendingActionsSubActive
          ? myPendingActions
          : prev.breakGlassCouncilActions?.myPendingActions ?? null,
        actionsMapper: { ...prev.breakGlassCouncilActions?.actionsMapper, ...actionsMapper },
      },
    }))
  }

  // mavryk council members update
  const updateCouncilMembers = (data: GetCouncilMembersQuery) => {
    const members = normalizeCouncilMembers(data.council[0].members)

    setCouncilCtxState((prev) => ({
      ...prev,
      councilMembers: members,
    }))
  }

  // break glass council members update
  const updateBreakGlassCouncilMembers = (data: GetBreakGlassCouncilMembersQuery) => {
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
