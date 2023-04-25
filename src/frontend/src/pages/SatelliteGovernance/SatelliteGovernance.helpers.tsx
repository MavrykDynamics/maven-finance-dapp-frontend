import { GovernanceSatelliteGraphQL, GovernanceSatelliteActionGraphQL } from 'utils/TypesAndInterfaces/Governance'

type SatelliteGovernanceActionType = {
  id: number
  executed: boolean
  purpose: string
  type: string
  status: number
  satelliteId: string
  initiatorId: string
  expirationDatetime: string
  startDatetime: string
  parameters: {
    name: string
    value: string
  }[]
  smvkPercentageForApproval: number
  smvkRequiredForApproval: number
  snapshotSmvkTotalSupply: number
  yayVoteSmvkTotal: number
  nayVoteSmvkTotal: number
  passVoteSmvkTotal: number
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
  }

  const actions = governanceSatelliteActions.reduce<SatelliteGovernanceActionsType>(
    (acc, item) => {
      const parameters = item.parameters.map((parameter) => ({
        value: parameter.value,
        name: parameter.name,
      }))

      const action = {
        id: item.id,
        executed: item.executed,
        purpose: item.governance_purpose,
        type: item.governance_type,
        status: item.status,
        satelliteId: item.governance_satellite_id,
        initiatorId: item.initiator_id,
        expirationDatetime: item.expiration_datetime ?? '',
        startDatetime: item.start_datetime ?? '',
        parameters,
        smvkPercentageForApproval: item.smvk_percentage_for_approval,
        smvkRequiredForApproval: item.smvk_required_for_approval,
        snapshotSmvkTotalSupply: item.snapshot_smvk_total_supply,
        yayVoteSmvkTotal: item.yay_vote_smvk_total,
        nayVoteSmvkTotal: item.nay_vote_smvk_total,
        passVoteSmvkTotal: item.pass_vote_smvk_total,
      }

      if (action.executed) {
        acc.pastSatelliteGovIds.push(action.id)
      }

      if (!action.executed) {
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
