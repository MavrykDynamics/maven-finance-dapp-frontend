// types
import { CouncilGraphQL, CouncilActionGraphQL, CouncilMembers } from '../../utils/TypesAndInterfaces/Council'

// helpers
import {
  defaultCouncilMemberImageMaxLength,
  defaultCouncilMemberNameMaxLength,
  defaultCouncilMemberWebsiteMaxLength,
  defaultRequestPurposeMaxLength,
  defaultRequestTokenNameMaxLength,
} from 'app/App.components/Input/Input.constants'

export const normalizeCouncilStorage = (storage: CouncilGraphQL) => {
  const { members = [] } = storage

  const councilMembers = members.map((member) => {
    return {
      id: member.id,
      name: member.name,
      image: member.image,
      userId: member.user_id,
      website: member.website,
    }
  })

  return {
    councilMemberImageMaxLength: storage?.council_member_image_max_length || defaultCouncilMemberImageMaxLength,
    councilMemberNameMaxLength: storage?.council_member_name_max_length || defaultCouncilMemberNameMaxLength,
    councilMemberWebsiteMaxLength: storage?.council_member_website_max_length || defaultCouncilMemberWebsiteMaxLength,
    requestPurposeMaxLength: storage?.request_purpose_max_length || defaultRequestPurposeMaxLength,
    requestTokenNameMaxLength: storage?.request_token_name_max_length || defaultRequestTokenNameMaxLength,
    councilMembers,
  }
}

type Options = {
  filterByAddress?: string
  filterWithoutAddress?: string
}

export function normalizeCouncilActions(storage: CouncilActionGraphQL[], options?: Options) {
  if (!storage?.length) return []

  const { filterByAddress = '', filterWithoutAddress = ''} = options ?? {}

  let list: CouncilActionGraphQL[] = []

  if (filterByAddress) {
    list = storage.filter((item) => item.initiator_id === filterByAddress)
  } else if (filterWithoutAddress) {
    list = storage.filter((item) => item.initiator_id !== filterWithoutAddress)
  } else {
    list = storage
  }

  return list.map((item) => {
    const signers = item?.signers?.length
      ? item.signers.map((signer) => {
          return {
            councilAction: signer.council_action || signer.break_glass_action,
            councilActionId: signer.council_action_id || signer.break_glass_action_id,
            id: signer.id,
            signer: signer.signer,
            signerId: signer.signer_id,
          }
        })
      : []

    return {
      actionType: item.action_type,
      councilId: item.council_id || item.break_glass_id,
      executed: item.executed,
      executionDatetime: item.execution_datetime,
      executionLevel: item.execution_level,
      expirationDatetime: item.expiration_datetime,
      id: item.id,
      initiator: item.initiator,
      initiatorId: item.initiator_id,
      parameters: item.parameters,
      parametersAggregate: item.parameters_aggregate,
      signers,
      signersAggregate: item.signers_aggregate,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime,
      status: item.status,
    }
  })
}

export const memberIsFirstOfList = (list: CouncilMembers, address?: string) => {
  const indexOfMember = list.findIndex((item) => item.userId === address)

  if (indexOfMember === -1) {
    return list
  }

  const updatedList = [list[indexOfMember]].concat(list.filter(({ userId }) => userId !== address))

  return updatedList
}
