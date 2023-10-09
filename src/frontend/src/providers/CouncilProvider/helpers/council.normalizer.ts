import dayjs from 'dayjs'

// types
import { GetBreakGlassCouncilMembersQuery, GetCouncilMembersQuery } from 'utils/__generated__/graphql'
import { BgCounsilActionsQueryType, CouncilActionType, CounsilActionsQueryType } from '../council.provider.types'

// utils
import { parseCamelCaseString, CAPITALIZE_CASE } from 'utils/parse'

type MavrykCounsilIndexerItemType = CounsilActionsQueryType['council_action'][number]
type BreakGlassCounsilIndexerItemType = BgCounsilActionsQueryType['break_glass_action'][number]

const checkWhetherMavrykCounsilAction = (
  indexerAction: BreakGlassCounsilIndexerItemType | MavrykCounsilIndexerItemType,
): indexerAction is MavrykCounsilIndexerItemType => {
  return 'council' in indexerAction
}

export const normalizeCouncilAction = (
  indexerAction: BreakGlassCounsilIndexerItemType | MavrykCounsilIndexerItemType,
) => {
  const actionCommonDataBetweenCollections = {
    actionType: indexerAction.action_type,
    actionName: parseCamelCaseString(indexerAction.action_type, CAPITALIZE_CASE),
    executed: indexerAction.executed,
    id: indexerAction.id,
    initiatorAddress: indexerAction.initiator.address,
    signersCount: indexerAction.signers_count,
    startDatetime: indexerAction.start_datetime ?? null,
    expirationTime: indexerAction.expiration_datetime ?? null,
    parameters: indexerAction.parameters,
    councilSize: indexerAction.council_size_snapshot,
  }

  if (checkWhetherMavrykCounsilAction(indexerAction)) {
    return {
      ...actionCommonDataBetweenCollections,
      counsilAddress: indexerAction.council.address,
    }
  } else {
    return {
      ...actionCommonDataBetweenCollections,
      counsilAddress: indexerAction.break_glass.address,
    }
  }
}

export const normalizeCouncilActions = (
  storage: BgCounsilActionsQueryType['break_glass_action'] | CounsilActionsQueryType['council_action'],
  userAddress: string | null,
) => {
  const convertedStorageForTs = storage as Array<MavrykCounsilIndexerItemType | BreakGlassCounsilIndexerItemType>

  return convertedStorageForTs.reduce<{
    allPendingActions: Array<number>
    notMyPendingActions: Array<number>
    myPendingActions: Array<number>
    allPastActions: Array<number>
    myPastActions: Array<number>
    actionsMapper: Record<number, CouncilActionType>
  }>(
    (acc, indexerAction) => {
      const normalizedAction = normalizeCouncilAction(indexerAction)
      const { id: actionId, initiatorAddress, executed, expirationTime } = normalizedAction

      const isUserAction = initiatorAddress === userAddress
      const isPastAction = executed || (expirationTime && dayjs().isAfter(dayjs(expirationTime)))

      if (isPastAction) acc.allPastActions.push(actionId)
      // user created past action
      if (isPastAction && isUserAction) acc.myPastActions.push(actionId)

      if (!isPastAction) acc.allPendingActions.push(actionId)
      // user created active actions
      if (!isPastAction && isUserAction) acc.myPendingActions.push(actionId)
      // active actions by other user, current user can vote on
      if (!isPastAction && !isUserAction) acc.notMyPendingActions.push(actionId)

      acc.actionsMapper[actionId] = normalizedAction
      return acc
    },
    {
      allPendingActions: [],
      notMyPendingActions: [],
      myPendingActions: [],
      allPastActions: [],
      myPastActions: [],
      actionsMapper: {},
    },
  )
}

export function normalizeCouncilMembers(
  storage:
    | GetBreakGlassCouncilMembersQuery['break_glass_council_member']
    | GetCouncilMembersQuery['council'][0]['members'],
) {
  if (!storage.length) return []

  return storage.map((item) => {
    return {
      id: item.id,
      name: item.name,
      image: item.image,
      userId: item.user.address,
      website: item.website,
    }
  })
}
