import { CouncilActionType, CouncilActionsType } from 'utils/TypesAndInterfaces/Council'
import { GetBreakGlassCouncilMembersQuery, GetPastBreakGlassCouncilActionsQuery } from 'utils/__generated__/graphql'

export function normalizeCouncilMembers({ break_glass_council_member }: GetBreakGlassCouncilMembersQuery) {
  if (!break_glass_council_member.length) return []

  return break_glass_council_member.map((item) => {
    return {
      id: item.id,
      name: item.name,
      image: item.image,
      userId: item.user.address,
      website: item.website,
    }
  })
}

export function normalizeCouncilActions({ break_glass_action = [] }: GetPastBreakGlassCouncilActionsQuery) {
  const initialData: CouncilActionsType = {
    allPendingActions: [],
    notMyPendingActions: [],
    myPendingActions: [],
    allPastActions: [],
    myPastActions: [],
    actionsMapper: {},
  }

  if (!break_glass_action?.length) return initialData

  const normalizedActions = break_glass_action.reduce<CouncilActionsType>((acc, item) => {
    const action: CouncilActionType = {
      actionType: item.action_type,
      councilId: item.break_glass?.address,
      executed: item.executed,
      id: item.id,
      initiatorId: item.initiator.address,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime ?? '',
      parameters: item.parameters,
      councilSize: item.council_size_snapshot,
    }

    // TODO add id's push
    acc.actionsMapper[action.id] = action

    return acc
  }, initialData)

  return normalizedActions
}
