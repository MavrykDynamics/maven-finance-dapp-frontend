import dayjs from 'dayjs'

// types
import { GetBreakGlassCouncilMembersQuery, GetCouncilMembersQuery } from 'utils/__generated__/graphql'
import { BgCouncilActionsQueryType, CouncilActionsQueryType, CouncilActionType } from '../council.provider.types'

// utils
import { checkWhetherActionParamValid, getClientActionIdByIndexerActionType } from './council.utils'

// consts
import { COUNCIL_FORMS_NAMES_MAPPER, DROP_COUNCIL_ACTION_FORM } from 'pages/Council/helpers/council.consts'

type MavrykCounsilIndexerItemType = CouncilActionsQueryType['council_action'][number]
type BreakGlassCounsilIndexerItemType = BgCouncilActionsQueryType['break_glass_action'][number]
type CouncilActionParametersType = Array<{ id: number; name: string; value: string }>
type CouncilActionSignersType = Array<{ signer: { address: string } }>

const checkWhetherMavrykCounsilAction = (
  indexerAction: BreakGlassCounsilIndexerItemType | MavrykCounsilIndexerItemType,
): indexerAction is MavrykCounsilIndexerItemType => {
  return 'council' in indexerAction
}

export const normalizeCouncilAction = (
  indexerAction: BreakGlassCounsilIndexerItemType | MavrykCounsilIndexerItemType,
): CouncilActionType | null => {
  const isMavrykCouncilAction = checkWhetherMavrykCounsilAction(indexerAction)
  const actionClientId = getClientActionIdByIndexerActionType(indexerAction.action_type, !isMavrykCouncilAction)

  // check whether action is handled on client, if not skip it and show log
  if (!actionClientId) {
    console.error(
      `wrong action_type, received: ${indexerAction.action_type}, check avaliable action_type's in getClientActionIdByIndexerActionType fn`,
    )
    return null
  }

  const actionName = COUNCIL_FORMS_NAMES_MAPPER[actionClientId]
  const actionParams: CouncilActionParametersType = indexerAction.parameters
  const actionSigners: CouncilActionSignersType = indexerAction.signers

  const actionCommonDataBetweenCollections = {
    id: indexerAction.id,
    actionClientId,
    actionName,
    status: indexerAction.status,
    executed: indexerAction.executed,
    initiatorAddress: indexerAction.initiator.address,
    signersCount: indexerAction.signers_count,
    startDatetime: indexerAction.start_datetime ?? null,
    expirationTime: indexerAction.expiration_datetime ?? null,
    signers: actionSigners.reduce<Array<string>>((acc, { signer: { address } }) => [...acc, address], []),
    parameters: actionParams.reduce<CouncilActionType['parameters']>((acc, { name, value, id }) => {
      if (checkWhetherActionParamValid(name)) {
        acc.push({
          name,
          value,
          id,
        })
      }

      return acc
    }, []),
    councilSize: indexerAction.council_size_snapshot,
  }

  if (isMavrykCouncilAction) {
    return {
      ...actionCommonDataBetweenCollections,
      councilAddress: indexerAction.council.address,
    }
  } else {
    return {
      ...actionCommonDataBetweenCollections,
      councilAddress: indexerAction.break_glass.address,
    }
  }
}

export const normalizeCouncilActions = (
  storage: BgCouncilActionsQueryType['break_glass_action'] | CouncilActionsQueryType['council_action'],
  userAddress: string | null,
) => {
  const convertedStorageForTs = storage as Array<MavrykCounsilIndexerItemType | BreakGlassCounsilIndexerItemType>

  return convertedStorageForTs.reduce<{
    allPendingActions: Array<number>
    actionsToSign: Array<number>
    myPendingActions: Array<number>
    allPastActions: Array<number>
    myPastActions: Array<number>
    actionsMapper: Record<number, CouncilActionType>
  }>(
    (acc, indexerAction) => {
      const normalizedAction = normalizeCouncilAction(indexerAction)

      if (!normalizedAction) return acc

      const { id: actionId, initiatorAddress, expirationTime, signers, actionClientId, status } = normalizedAction

      const isUserAction = initiatorAddress === userAddress
      const isPastAction = (expirationTime && dayjs().isAfter(dayjs(expirationTime))) || status === 1 || status === 2
      const isDropAction = actionClientId === DROP_COUNCIL_ACTION_FORM

      if (isPastAction && !isDropAction) acc.allPastActions.push(actionId)
      // user created past action
      if (isPastAction && isUserAction && !isDropAction) acc.myPastActions.push(actionId)

      if (!isPastAction && !isDropAction) acc.allPendingActions.push(actionId)
      // user created active actions
      if (!isPastAction && isUserAction) acc.myPendingActions.push(actionId)
      // active actions by other user, current user can vote on
      if (!isPastAction && userAddress && !signers.includes(userAddress)) acc.actionsToSign.push(actionId)

      acc.actionsMapper[actionId] = normalizedAction
      return acc
    },
    {
      allPendingActions: [],
      actionsToSign: [],
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
      memberAddress: item.user.address,
      website: item.website,
      isMemberSatellite: item.user.satellites[0]?.currently_registered && item.user.satellites[0]?.status === 0,
    }
  })
}
