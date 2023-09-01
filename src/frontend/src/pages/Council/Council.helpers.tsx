// types
import {
  CouncilGraphQL,
  CouncilActionGraphQL,
  CouncilMemberGraphQL,
  CouncilMembers,
  CouncilActionsType,
  CouncilActionType,
} from '../../utils/TypesAndInterfaces/Council'

// helpers
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
} from 'app/App.components/Input/Input.constants'

export const PAST_ACTIONS = 'PAST_ACTIONS'
export const PENDING_ACTIONS = 'PENDING_ACTIONS'

type FilterType = typeof PAST_ACTIONS | typeof PENDING_ACTIONS

export function normalizeCouncilActions(
  storage: CouncilActionGraphQL[],
  typeOfActions: FilterType,
  userAddress?: string,
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
      councilId: item.council?.address ?? item.break_glass?.address,
      executed: item.executed,
      id: item.id,
      initiatorId: item.initiator.address,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime ?? '',
      parameters: item.parameters,
      councilSize: item.council_size_snapshot,
    }

    acc.actionsMapper[action.id] = action

    if (typeOfActions === PENDING_ACTIONS) {
      acc.allPendingActions.push(action.id)

      if (userAddress === action.initiatorId) {
        acc.myPendingActions.push(action.id)
      } else {
        acc.notMyPendingActions.push(action.id)
      }
    } else {
      acc.allPastActions.push(action.id)

      if (userAddress === action.initiatorId) {
        acc.myPastActions.push(action.id)
      }
    }

    return acc
  }, initialData)

  return normalizedActions
}

export function normalizeCouncilMembers(storage: CouncilMemberGraphQL[]) {
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

export const memberIsFirstOfList = (list: CouncilMembers, address?: string | null) => {
  const indexOfMember = list.findIndex((item) => item.userId === address)

  if (indexOfMember === -1) {
    return list
  }

  const updatedList = [list[indexOfMember]].concat(list.filter(({ userId }) => userId !== address))

  return updatedList
}
