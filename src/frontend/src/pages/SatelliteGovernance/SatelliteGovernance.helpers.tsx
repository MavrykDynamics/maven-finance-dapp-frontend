import { StatusFlagKind } from 'app/App.components/StatusFlag/StatusFlag.constants'
import {
  GovernanceSatelliteGraphQL,
  GovernanceSatelliteActionGraphQL,
  ProposalStatus,
} from 'utils/TypesAndInterfaces/Governance'

type SatelliteGovernanceActionType = {
  id: number
  executed: boolean
  purpose: string
  type: string
  status: number
  statusFlag: StatusFlagKind
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
  satelliteGovIdsMapper: Record<number, SatelliteGovernanceActionType>
}

type SatelliteGovernanceType = {
  storage: {
    governance_satellite: GovernanceSatelliteGraphQL[]
    governance_satellite_action: GovernanceSatelliteActionGraphQL[]
  }
  userAddress?: string
}

export const normalizerSatelliteGovernance = ({ storage, userAddress }: SatelliteGovernanceType) => {
  const { governance_satellite, governance_satellite_action: governanceSatelliteActions } = storage
  const [governanceSatellite] = governance_satellite

  const config = {
    address: governanceSatellite.address,
    admin: governanceSatellite.admin,
    purposeMaxLength: governanceSatellite.gov_purpose_max_length,
    approvalPercentage: governanceSatellite.gov_sat_approval_percentage,
    durationInDays: governanceSatellite.gov_sat_duration_in_days,
    counter: governanceSatellite.governance_satellite_counter,
    governanceId: governanceSatellite.governance_id,
    maxActionsCount:
      governanceSatellite.max_actions_per_satellite === 0 ? 10 : governanceSatellite.max_actions_per_satellite,
  }

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
        voterId: item.voter_id,
      }))

      const timeNow = Date.now()
      const expirationDatetime = new Date(item.expiration_datetime ?? 0).getTime()
      const isEndingVotingTime = expirationDatetime > timeNow

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
        satelliteId: item.governance_satellite_id,
        initiatorId: item.initiator_id,
        expirationDatetime: item.expiration_datetime ?? null,
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

      acc.satelliteGovIdsMapper[action.id] = action

      return acc
    },
    {
      ongoingSatelliteGovIds: [],
      pastSatelliteGovIds: [],
      mySatelliteGovIds: [],
      satelliteGovIdsMapper: {},
    },
  )

  return {
    config,
    ...actions,
  }
}
