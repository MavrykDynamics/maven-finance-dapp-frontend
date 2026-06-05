import dayjs from 'dayjs'
import { usePrevious } from 'react-use'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// utils
import { normalizeCouncilActions, normalizeCouncilMembers } from './helpers/council.normalizer'
import { getCouncilProviderReturnValue } from './helpers/council.utils'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useGraphQLQuery, useGraphQLQueryOnce, CACHE_STATIC, CACHE_SEMI_STATIC } from 'providers/QueryProvider/useGraphQLQuery'

// types
import {
  BgCouncilActionsQueryType,
  CouncilActionsQueryType,
  CouncilContext,
  CouncilSubsRecordType,
  NullableCouncilContextStateType,
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
  ALL_BG_ONGOING_COUNCILS_QUERY,
  ALL_BG_PAST_COUNCILS_QUERY,
  BREAK_GLASS_COUNCIL_MEMBERS_QUERY,
  MY_BG_PAST_COUNCILS_QUERY,
} from './queries/breakGlassCouncil.query'
import {
  ALL_ONGOING_COUNCILS_QUERY,
  ALL_PAST_COUNCILS_QUERY,
  COUNCIL_MEMBERS_QUERY,
  MY_PAST_COUNCILS_QUERY,
} from './queries/council.query'

export const councilContext = React.createContext<CouncilContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const refetchQueryVariables = () => ({
  currentTimestamp: dayjs().toISOString(),
})

const CouncilProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()
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
      setCouncilCtxState((prev) => {
        const newBgCouncilUserPendingActions = prev.breakGlassCouncilActions?.allPendingActions?.filter(
          (actionId) =>
            actionId &&
            prev.breakGlassCouncilActions?.actionsMapper &&
            prev.breakGlassCouncilActions?.actionsMapper[actionId]?.initiatorAddress === userAddress,
        )
        const newBgCouncilNotUserPendingActions = prev.breakGlassCouncilActions?.allPendingActions?.filter(
          (actionId) =>
            actionId &&
            prev.breakGlassCouncilActions?.actionsMapper &&
            prev.breakGlassCouncilActions?.actionsMapper[actionId]?.initiatorAddress !== userAddress,
        )

        const newMavCouncilUserPendingActions = prev.councilActions?.allPendingActions?.filter(
          (actionId) =>
            actionId &&
            prev.councilActions?.actionsMapper &&
            prev.councilActions?.actionsMapper[actionId]?.initiatorAddress === userAddress,
        )
        const newMavCouncilNotUserPendingActions = prev.councilActions?.allPendingActions?.filter(
          (actionId) =>
            actionId &&
            prev.councilActions?.actionsMapper &&
            prev.councilActions?.actionsMapper[actionId]?.initiatorAddress !== userAddress,
        )

        return {
          ...prev,
          breakGlassCouncilActions: {
            actionsMapper: prev.breakGlassCouncilActions?.actionsMapper ?? null,
            allPendingActions: prev.breakGlassCouncilActions?.allPendingActions ?? null,
            allPastActions: prev.breakGlassCouncilActions?.allPastActions ?? null,
            myPastActions: DEFAULT_COUNCIL_CTX.breakGlassCouncilActions?.myPastActions ?? null,
            actionsToSign: newBgCouncilNotUserPendingActions ?? null,
            myPendingActions: newBgCouncilUserPendingActions ?? null,
          },
          councilActions: {
            actionsMapper: prev.councilActions?.actionsMapper ?? null,
            allPendingActions: prev.councilActions?.allPendingActions ?? null,
            allPastActions: prev.councilActions?.allPastActions ?? null,
            myPastActions: DEFAULT_COUNCIL_CTX.councilActions?.myPastActions ?? null,
            actionsToSign: newMavCouncilNotUserPendingActions ?? null,
            myPendingActions: newMavCouncilUserPendingActions ?? null,
          },
        }
      })
    }
  }, [userAddress])

  /**
   * councils members:
   * COUNCIL_MEMBERS_QUERY -> members of maven council
   * BREAK_GLASS_COUNCIL_MEMBERS_QUERY -> members of break glass council
   */
  // Council membership only changes via completed council votes — load once per session.
  useGraphQLQueryOnce(COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[COUNCIL_MEMBERS_SUB],
    staleTime: CACHE_STATIC,
    onCompleted: (data) => updateCouncilMembers(data),
    onError: (error) => handleQueryError(error, 'COUNCIL_MEMBERS_QUERY'),
  })

  useGraphQLQueryOnce(BREAK_GLASS_COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[BG_COUNCIL_MEMBERS_SUB],
    staleTime: CACHE_STATIC,
    onCompleted: (data) => updateBreakGlassCouncilMembers(data),
    onError: (error) => handleQueryError(error, 'BREAK_GLASS_COUNCIL_MEMBERS_QUERY'),
  })

  // Maven Council: 3 hooks (all-past, my-past, all-ongoing) → 1 dynamic hook.
  // All three queries return identical shapes — only the where clause differs.
  const mavCouncilDoc = useMemo(() => {
    switch (activeSubs[COUNCIL_ACTIONS_DATA]) {
      case ALL_PAST_COUNCIL_ACTIONS_SUB: return ALL_PAST_COUNCILS_QUERY
      case MY_PAST_COUNCIL_ACTIONS_SUB: return MY_PAST_COUNCILS_QUERY
      case ALL_ONGOING_COUNCIL_ACTIONS_SUB: return ALL_ONGOING_COUNCILS_QUERY
      default: return null
    }
  }, [activeSubs])

  useGraphQLQuery(
    mavCouncilDoc ?? ALL_PAST_COUNCILS_QUERY,
    {
      skip: !mavCouncilDoc,
      staleTime: CACHE_SEMI_STATIC,
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress: userAddress ?? '',
      },
      onCompleted: (data) => updateCouncilActionsData(data),
      onError: (error) => handleQueryError(error, 'COUNCIL_ACTIONS_QUERY'),
    },
    { refetchQueryVariables },
  )

  // Break Glass Council: same pattern → 1 dynamic hook.
  const bgCouncilDoc = useMemo(() => {
    switch (activeSubs[BG_COUNCIL_ACTIONS_DATA]) {
      case ALL_BG_PAST_COUNCIL_ACTIONS_SUB: return ALL_BG_PAST_COUNCILS_QUERY
      case MY_BG_PAST_COUNCIL_ACTIONS_SUB: return MY_BG_PAST_COUNCILS_QUERY
      case ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB: return ALL_BG_ONGOING_COUNCILS_QUERY
      default: return null
    }
  }, [activeSubs])

  useGraphQLQuery(
    bgCouncilDoc ?? ALL_BG_PAST_COUNCILS_QUERY,
    {
      skip: !bgCouncilDoc,
      staleTime: CACHE_SEMI_STATIC,
      variables: {
        currentTimestamp: currentTimeRef.current,
        userAddress: userAddress ?? '',
      },
      onCompleted: (data) => updateBreakGlassCouncilActionsData(data),
      onError: (error) => handleQueryError(error, 'BG_COUNCIL_ACTIONS_QUERY'),
    },
    { refetchQueryVariables },
  )

  // maven council actions update
  const updateCouncilActionsData = (data: CouncilActionsQueryType) => {
    const { myPastActions, myPendingActions, actionsToSign, allPastActions, allPendingActions, actionsMapper } =
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
        actionsToSign:
          isPendingActionsSubActive || isMyPastActionsSubActive
            ? actionsToSign
            : prev.councilActions?.actionsToSign ?? null,
        myPendingActions: isPendingActionsSubActive ? myPendingActions : prev.councilActions?.myPendingActions ?? null,
        actionsMapper: { ...prev.councilActions?.actionsMapper, ...actionsMapper },
      },
    }))
  }

  // break glass council actions update
  const updateBreakGlassCouncilActionsData = (data: BgCouncilActionsQueryType) => {
    const { myPastActions, myPendingActions, actionsToSign, allPastActions, allPendingActions, actionsMapper } =
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
        actionsToSign:
          isPendingActionsSubActive || isMyPastActionsSubActive
            ? actionsToSign
            : prev.breakGlassCouncilActions?.actionsToSign ?? null,
        myPendingActions: isPendingActionsSubActive
          ? myPendingActions
          : prev.breakGlassCouncilActions?.myPendingActions ?? null,
        actionsMapper: { ...prev.breakGlassCouncilActions?.actionsMapper, ...actionsMapper },
      },
    }))
  }

  // maven council members update
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

  const changeCouncilSubscriptionList = useCallback((newSubs: Partial<CouncilSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSubs }))
  }, [])

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
