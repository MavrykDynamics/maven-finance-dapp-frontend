import { OpKind, Wallet } from '@taquito/taquito'
import { StatusFlagKind } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { GetState } from 'app/App.controller'
import {
  GovernanceSatelliteGraphQL,
  GovernanceSatelliteActionGraphQL,
  ProposalStatus,
} from 'utils/TypesAndInterfaces/Governance'

import { UnwrapPromise } from 'types/general'

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

const DEFAULT_ACTIONS_PER_CYCLE = 10

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
    governanceId: governanceSatellite.governance.address,
    // TODO remove 10 when api will return proper value, right now it's 0 instead of 10
    maxActionsCount:
      governanceSatellite.max_actions_per_satellite === 0
        ? DEFAULT_ACTIONS_PER_CYCLE
        : governanceSatellite.max_actions_per_satellite,
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
        voterId: item.voter.address,
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
        satelliteId: item.governance_satellite.address,
        initiatorId: item.initiator.address,
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

export function createBatchForExpiredActions(getState: GetState, contract: UnwrapPromise<ReturnType<Wallet['at']>>) {
  const state = getState()

  const { mySatelliteGovIds, satelliteGovIdsMapper } = state.satelliteGovernance
  console.log(mySatelliteGovIds)
  const expriredActionIds: number[] = []

  const timeNow = Date.now()
  mySatelliteGovIds.forEach((id) => {
    const { expirationDatetime, status } = satelliteGovIdsMapper[id]
    const convertedExpirationDatetime = new Date(expirationDatetime ?? 0).getTime()
    const expired = convertedExpirationDatetime < timeNow

    if (expired && status === 0) expriredActionIds.push(id)
  })

  if (expriredActionIds.length === 0) return []

  const batchedArray = expriredActionIds.map((actionId) => ({
    kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
    ...contract.methods.dropAction(actionId).toTransferParams(),
  }))

  return batchedArray
}
