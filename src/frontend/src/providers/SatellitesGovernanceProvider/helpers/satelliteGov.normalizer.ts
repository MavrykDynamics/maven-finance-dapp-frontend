import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { GetGovernanceSatelliteActionsDataQuery, GetGovernanceSatelliteConfigQuery } from 'utils/__generated__/graphql'
import { SatelliteGovActionStatusType } from './satellitesGov.types'

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
  smvkPercentageForApproval: number
  smvkRequiredForApproval: number
  snapshotSmvkTotalSupply: number
  yayVoteSmvkTotal: number
  nayVoteSmvkTotal: number
  passVoteSmvkTotal: number
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
      gov_sat_approval_percentage,
      gov_sat_duration_in_days,
      governance_satellite_counter,
      governance,
      max_actions_per_satellite = 10, // default 10 for max actions per satellite
    },
  ] = config.governance_satellite

  return {
    address,
    admin,
    approvalPercentage: gov_sat_approval_percentage,
    durationInDays: gov_sat_duration_in_days,
    counter: governance_satellite_counter,
    governanceId: governance.address,
    maxActionsCount: max_actions_per_satellite,
  }
}

export const normalizerSatelliteGovernanceActions = (
  actionsData: GetGovernanceSatelliteActionsDataQuery,
  userAddress: string | null,
) => {
  const { governance_satellite_action: governanceSatelliteActions } = actionsData

  const actions = governanceSatelliteActions.reduce<SatelliteGovernanceActionsType>(
    (acc, item) => {
      const parameters = item.parameters.map((parameter) => ({
        value: parameter.value,
        name: parameter.name,
      }))

      const votes = item.votes.map((item) => ({
        actionId: item.governance_satellite_action_id,
        id: item.id,
        timestamp: item.timestamp ?? null,
        vote: item.vote,
        voterId: item.voter.address,
      }))

      const timeNow = Date.now()
      const expirationDatetime = new Date(item.expiration_datetime ?? 0).getTime()
      const isEndingVotingTime = expirationDatetime > timeNow

      // detect if action is EXECUTED | DEFEATED | DROPPED etc.
      const statusFlag = item.executed
        ? ProposalStatus.EXECUTED
        : item.status === 1
        ? ProposalStatus.DROPPED
        : isEndingVotingTime
        ? ProposalStatus.ONGOING
        : ProposalStatus.DEFEATED

      const action = {
        id: item.id,
        executed: item.executed,
        purpose: item.governance_purpose,
        type: item.governance_type,
        status: item.status,
        statusFlag,
        satelliteId: item.governance_satellite.address,
        initiatorId: item.initiator.address,
        expirationDatetime: item.executed ? item.execution_datetime : item.expiration_datetime ?? null,
        startDatetime: item.start_datetime ?? null,
        smvkPercentageForApproval: item.smvk_percentage_for_approval,
        smvkRequiredForApproval: item.smvk_required_for_approval,
        snapshotSmvkTotalSupply: item.snapshot_smvk_total_supply,
        yayVoteSmvkTotal: item.yay_vote_smvk_total,
        nayVoteSmvkTotal: item.nay_vote_smvk_total,
        passVoteSmvkTotal: item.pass_vote_smvk_total,
        parameters,
        votes,
      }

      // when sub type is SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB, need this logic
      // to detect ongoing | user | past actions
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
      const statusOrder = [
        ProposalStatus.ONGOING,
        ProposalStatus.EXECUTED,
        ProposalStatus.DROPPED,
        ProposalStatus.DEFEATED,
      ] as const

      const statusA = actions.satelliteGovIdsMapper[a].statusFlag
      const statusB = actions.satelliteGovIdsMapper[b].statusFlag

      return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB)
    }),
  }
}
