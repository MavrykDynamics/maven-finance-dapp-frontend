import dayjs from 'dayjs'
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'

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
  BG_COUNCIL_ACTIONS_DATA,
  BREAK_GLASS_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  DEFAULT_COUNCIL_CTX,
} from './helpers/council.consts'
import { BREAK_GLASS_COUNCIL_MEMBERS_QUERY, getBreakGlassCouncilActions } from './queries/breakGlassCouncil.query'
import { COUNCIL_MEMBERS_QUERY, getCouncilActions } from './queries/council.query'

export const councilContext = React.createContext<CouncilContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// @mxkucher I didn't replaced old redux logic yet
// also I tested queries only inside hasura
const CouncilProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()
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

  // council members
  useQueryWithRefetch(COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => {
      updateCouncilMembers(data)
    },
    onError: (error) => handleApolloError(error, 'COUNCIL_MEMBERS_SUB'),
  })

  // council actions
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
      onError: (error) => handleApolloError(error, 'getCouncilActions'),
    },
    { refetchQueryVariables },
  )

  // break glass members
  useQueryWithRefetch(BREAK_GLASS_COUNCIL_MEMBERS_QUERY, {
    skip: !activeSubs[BREAK_GLASS_COUNCIL_MEMBERS_SUB],
    onCompleted: (data) => {
      updateBreakGlassCouncilMembers(data)
    },
    onError: (error) => handleApolloError(error, 'COUNCIL_MEMBERS_SUB'),
  })

  // break glass actions
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
      onError: (error) => handleApolloError(error, 'getBreakGlassCouncilActions'),
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

  // @mxkucher Take a look at  getCouncilProviderReturnValue for isLoading --------------------------------------------------------------------------------
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
