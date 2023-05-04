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
      councilId: item.council_id ?? item.break_glass_id,
      executed: item.executed,
      id: item.id,
      initiatorId: item.initiator_id,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime ?? '',
      parameters: item.parameters,
      councilSize: item.council_size_snapshot
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
      userId: item.user_id,
      website: item.website,
    }
  })
}

export const normalizeMaxLength = (storage: CouncilGraphQL) => {
  return {
    councilMemberImageMaxLength: storage?.council_member_image_max_length ?? defaultCouncilMemberImageMaxLength,
    councilMemberNameMaxLength: storage?.council_member_name_max_length ?? defaultCouncilMemberNameMaxLength,
    councilMemberWebsiteMaxLength: storage?.council_member_website_max_length ?? defaultCouncilMemberWebsiteMaxLength,
    requestPurposeMaxLength: storage?.request_purpose_max_length ?? defaultRequestPurposeMaxLength,
    requestTokenNameMaxLength: storage?.request_token_name_max_length ?? defaultRequestTokenNameMaxLength,
  }
}

export const memberIsFirstOfList = (list: CouncilMembers, address?: string) => {
  const indexOfMember = list.findIndex((item) => item.userId === address)

  if (indexOfMember === -1) {
    return list
  }

  const updatedList = [list[indexOfMember]].concat(list.filter(({ userId }) => userId !== address))

  return updatedList
}
