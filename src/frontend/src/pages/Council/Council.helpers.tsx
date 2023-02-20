// types
import {
  CouncilGraphQL,
  CouncilActionGraphQL,
  CouncilMemberGraphQL,
  CouncilMembers,
} from '../../utils/TypesAndInterfaces/Council'

// helpers
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
} from 'app/App.components/Input/Input.constants'

type Options = {
  filterByAddress?: string
  filterWithoutAddress?: string
}

export function normalizeCouncilActions(storage: CouncilActionGraphQL[], options?: Options) {
  if (!storage?.length) return []

  const { filterByAddress = '', filterWithoutAddress = '' } = options ?? {}

  let list: CouncilActionGraphQL[] = []

  if (filterByAddress) {
    list = storage.filter((item) => item.initiator_id === filterByAddress)
  } else if (filterWithoutAddress) {
    list = storage.filter((item) => item.initiator_id !== filterWithoutAddress)
  } else {
    list = storage
  }

  return list.map((item) => {
    return {
      actionType: item.action_type,
      councilId: item.council_id ?? item.break_glass_id,
      executed: item.executed,
      id: item.id,
      initiatorId: item.initiator_id,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime,
      parameters: item.parameters,
    }
  })
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
