// consts
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'

// types
import { GetGovernanceSatelliteConfigQuery } from 'utils/__generated__/graphql'
import { SatelliteGovActionStatusType } from './satellitesGov.types'
import { SatelliteGovernanceActionsIndexerType } from '../satelliteGovernance.provider.types'

type SatelliteGovernanceActionType = {
  id: number
  executed: boolean
  purpose: string
  type: string
  status: number
  statusFlag: SatelliteGovActionStatusType
  satelliteId: string
  initiatorId: string
  expirationDatetime: string | null
  startDatetime: string | null
  droppedTime: string | null
  smvnPercentageForApproval: number
  smvnRequiredForApproval: number
  snapshotSmvnTotalSupply: number
  yayVotesSmvnTotal: number
  nayVotesSmvnTotal: number
  passVotesSmvnTotal: number
  parameters: {
    name: string
    value: string
  }[]
  votes: {
    actionId: number
    id: number
    timestamp: string | null
    vote: number
    voterId: string
  }[]
}

const SATELLITE_GOV_USER_ACTIONS_SORT_ORDER = [
  ProposalStatus.ONGOING,
  ProposalStatus.EXECUTED,
  ProposalStatus.DROPPED,
  ProposalStatus.DEFEATED,
] as const

type SatelliteGovernanceActionsType = {
  ongoingSatelliteGovIds: number[]
  pastSatelliteGovIds: number[]
  mySatelliteGovIds: number[]
  allSatelliteGovIds: number[]
  satelliteGovIdsMapper: Record<number, SatelliteGovernanceActionType>
}

export const normalizeSatelliteGovernanceConfig = (config: GetGovernanceSatelliteConfigQuery) => {
  const [
    {
      address,
      admin,
      approval_percentage,
      sat_action_duration_in_days,
      governance_satellite_counter,
      governance,
      max_actions_per_satellite = 10, // default 10 for max actions per satellite
    },
  ] = config.governance_satellite

  return {
    address,
    admin,
    approvalPercentage: approval_percentage,
    durationInDays: sat_action_duration_in_days,
    counter: governance_satellite_counter,
    governanceId: governance.address,
    maxActionsCount: max_actions_per_satellite,
  }
}

export const normalizerSatelliteGovernanceAction = (
  actionData: SatelliteGovernanceActionsIndexerType['governance_satellite_action'][number],
) => {
  const parameters = actionData.parameters.map((parameter) => ({
    value: parameter.value,
    name: parameter.name,
  }))

  const votes = actionData.votes.map((item) => ({
    actionId: item.governance_satellite_action_id,
    id: item.id,
    timestamp: item.timestamp ?? null,
    vote: item.vote,
    voterId: item.voter.address,
  }))

  const timeNow = Date.now()
  const expirationDatetime = new Date(actionData.expiration_datetime ?? 0).getTime()
  const isEndingVotingTime = expirationDatetime > timeNow

  // detect if action is EXECUTED | DEFEATED | DROPPED etc.
  const statusFlag = actionData.executed
    ? ProposalStatus.EXECUTED
    : actionData.status === 1
    ? ProposalStatus.DROPPED
    : isEndingVotingTime
    ? ProposalStatus.ONGOING
    : ProposalStatus.DEFEATED

  return {
    id: actionData.id,
    executed: actionData.executed,
    purpose: actionData.governance_purpose,
    type: actionData.governance_type,
    status: actionData.status,
    statusFlag,
    satelliteId: actionData.governance_satellite.address,
    initiatorId: actionData.initiator.address,
    expirationDatetime: actionData.executed ? actionData.execution_datetime : actionData.expiration_datetime ?? null,
    startDatetime: actionData.start_datetime ?? null,
    droppedTime: statusFlag === ProposalStatus.DROPPED ? actionData.dropped_datetime : null,
    smvnPercentageForApproval: actionData.smvk_percentage_for_approval,
    smvnRequiredForApproval: actionData.smvk_required_for_approval,
    snapshotSmvnTotalSupply: actionData.snapshot_smvk_total_supply,
    yayVotesSmvnTotal: actionData.yay_vote_smvk_total,
    nayVotesSmvnTotal: actionData.nay_vote_smvk_total,
    passVotesSmvnTotal: actionData.pass_vote_smvk_total,
    parameters,
    votes,
  }
}

export const normalizerSatelliteGovernanceActions = (
  actionsData: SatelliteGovernanceActionsIndexerType,
  userAddress: string | null,
) => {
  const { governance_satellite_action: governanceSatelliteActions } = actionsData

  const actions = governanceSatelliteActions.reduce<SatelliteGovernanceActionsType>(
    (acc, item) => {
      const action = normalizerSatelliteGovernanceAction(item)

      // filter actions by past, user, ongoing
      if (
        action.statusFlag === ProposalStatus.EXECUTED ||
        action.statusFlag === ProposalStatus.DROPPED ||
        action.statusFlag === ProposalStatus.DEFEATED
      ) {
        acc.pastSatelliteGovIds.push(action.id)
      }

      if (action.statusFlag === ProposalStatus.ONGOING) {
        acc.ongoingSatelliteGovIds.push(action.id)
      }

      if (action.initiatorId === userAddress) {
        acc.mySatelliteGovIds.push(action.id)
      }
      acc.allSatelliteGovIds.push(action.id)
      acc.satelliteGovIdsMapper[action.id] = action

      return acc
    },
    {
      ongoingSatelliteGovIds: [],
      pastSatelliteGovIds: [],
      mySatelliteGovIds: [],
      allSatelliteGovIds: [],
      satelliteGovIdsMapper: {},
    },
  )

  return {
    ...actions,
    // sort user actions
    mySatelliteGovIds: actions.mySatelliteGovIds.sort((a, b) => {
      const statusA = actions.satelliteGovIdsMapper[a].statusFlag
      const statusB = actions.satelliteGovIdsMapper[b].statusFlag

      return (
        SATELLITE_GOV_USER_ACTIONS_SORT_ORDER.indexOf(statusA) - SATELLITE_GOV_USER_ACTIONS_SORT_ORDER.indexOf(statusB)
      )
    }),
  }
}
