import { CouncilActionType, CouncilActionsType } from 'utils/TypesAndInterfaces/Council'
import {
  GetBreakGlassCouncilMembersQuery,
  GetBreakGlassCouncilActionsQuery,
  GetCouncilMembersQuery,
  GetCouncilActionsQuery,
} from 'utils/__generated__/graphql'
import {
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
  MY_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
} from './council.consts'
import { ValidationError } from 'errors/error'
import { BreakGlassCouncilActionsSubsType, CouncilActionsSubsType } from '../council.provider.types'

function pushIdBasedOnSubType(
  userAddress: string,
  sub: BreakGlassCouncilActionsSubsType | CouncilActionsSubsType,
  acc: CouncilActionsType,
  { id, initiatorId }: CouncilActionType,
) {
  switch (sub) {
    case ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB:
    case ALL_ONGOING_COUNCIL_ACTIONS_SUB:
      acc.allPendingActions.push(id)
      if (initiatorId !== userAddress) {
        acc.notMyPendingActions.push(id)
      }
      break
    case ALL_PAST_COUNCIL_ACTIONS_SUB:
    case ALL_BG_PAST_COUNCIL_ACTIONS_SUB:
      acc.allPastActions.push(id)
      break
    case MY_BG_PAST_COUNCIL_ACTIONS_SUB:
    case MY_PAST_COUNCIL_ACTIONS_SUB:
      acc.myPastActions.push(id)
      break
    case MY_ONGOING_COUNCIL_ACTIONS_SUB:
    case MY_BG_ONGOING_COUNCIL_ACTIONS_SUB:
      acc.myPendingActions.push(id)
      break
    default:
      throw new ValidationError('Incorrect council subscription type', {
        code: 400,
      })
  }
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

export function normalizeCouncilActions(
  storage: GetBreakGlassCouncilActionsQuery['break_glass_action'] | GetCouncilActionsQuery['council_action'],
  userAddress: string,
  sub: BreakGlassCouncilActionsSubsType | CouncilActionsSubsType,
) {
  const initialData: CouncilActionsType = {
    allPendingActions: [],
    notMyPendingActions: [],
    myPendingActions: [],
    allPastActions: [],
    myPastActions: [],
    actionsMapper: {},
  }

  if (!storage?.length) return initialData

  const normalizedActions = storage.reduce<CouncilActionsType>((acc, item) => {
    const action: CouncilActionType = {
      actionType: item.action_type,
      councilId: 'council' in item ? item.council?.address : item.break_glass?.address,
      executed: item.executed,
      id: item.id,
      initiatorId: item.initiator.address,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime ?? '',
      parameters: item.parameters,
      councilSize: item.council_size_snapshot,
    }

    pushIdBasedOnSubType(userAddress, sub, acc, action)
    acc.actionsMapper[action.id] = action

    return acc
  }, initialData)

  return normalizedActions
}
