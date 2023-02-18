import type { SatelliteRecordType, SatelliteVotingsType } from '../../utils/TypesAndInterfaces/Satellites'
import type { SatelliteRecordGraphQl, DelegationGraphQl } from '../../utils/TypesAndInterfaces/Satellites'
import {
  FinancialRequestRecord,
  GovernanceFinancialRequestGraphQL,
  ProposalRecordType,
} from 'utils/TypesAndInterfaces/Governance'
import { EmergergencyGovernanceItem } from 'utils/TypesAndInterfaces/EmergencyGovernance'

// helpers
import { calcWithoutMu, calcWithoutPrecision, getNumberInBounds } from '../../utils/calcFunctions'
import { Aggregator_Oracle } from 'utils/generated/graphqlTypes'
import {
  defaultSatelliteDescriptionMaxLength,
  defaultSatelliteNameMaxLength,
  defaultSatelliteWebsiteMaxLength,
} from 'app/App.components/Input/Input.constants'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

export const getSatelliteAccuracy = (satelliteRecord: SatelliteRecordGraphQl) => {
  const v1 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.aggregator?.last_completed_data),
    v2 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.observations?.[0]?.data)

  if (isNaN(v1) && isNaN(v2)) return 0

  const parsedV1 = isNaN(v1) ? 0 : v1,
    parsedv2 = isNaN(v2) ? 0 : v2
  return 100 - ((parsedV1 - parsedv2) / ((parsedV1 + parsedv2) / 2)) * 100
}

export const getNewSatelliteMetrics = ({
  pastProposals,
  proposalLedger,
  emergencyGovernanceLedger,
  satelliteVotings: { proposalVotingHistory, emergencyGovernanceVotes, financialRequestsVotes, satelliteActionVotes },
  satelliteAddress,
  financialRequestLedger,
  feeds,
}: {
  pastProposals: Array<ProposalRecordType>
  proposalLedger: Array<ProposalRecordType>
  emergencyGovernanceLedger: Array<EmergergencyGovernanceItem>
  satelliteVotings: SatelliteVotingsType
  satelliteAddress: string
  feeds: Array<Feed>
  financialRequestLedger: Array<FinancialRequestRecord>
}) => {
  const submittedProposalsCount = pastProposals
    .concat(proposalLedger)
    .reduce((acc, { locked, executed }) => (acc += locked && executed ? 1 : 0), 0)
  const totalVotingPeriods =
    (emergencyGovernanceLedger.length ?? 0) +
    (financialRequestLedger?.length ?? 0) +
    (proposalLedger.length ?? 0) +
    (pastProposals.length ?? 0)

  const votedProposalSubmitted = proposalVotingHistory.reduce((acc, { proposalId }) => {
    const isProposalSubmitted = pastProposals.find(({ id, executed }) => proposalId === id && executed)
    return isProposalSubmitted ? (acc += 1) : acc
  }, 0)

  const satelliteVotes =
    emergencyGovernanceVotes.length +
    satelliteActionVotes.length +
    proposalVotingHistory.length +
    financialRequestsVotes.length

  const observationsForSatellite = feeds
    ?.reduce<Aggregator_Oracle['observations']>(
      (acc, { oracles }) => acc.concat(...oracles.map(({ observations }) => observations)),
      [],
    )
    ?.filter(({ oracle: { user_id } }) => user_id === satelliteAddress)
    ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const latestObservation = observationsForSatellite?.[0]
  const numberOfObservations = observationsForSatellite?.length ?? 0
  const epochRoundRatio =
    (latestObservation?.epoch ?? 0) / (latestObservation?.round || 1) -
    (latestObservation?.oracle?.init_epoch ?? 0) / (latestObservation?.oracle?.init_round || 1)
  const oracleEfficiency = (numberOfObservations / Math.max(epochRoundRatio, 1)) * 100

  return {
    proposalParticipation: submittedProposalsCount
      ? getNumberInBounds(0, 100, Number((votedProposalSubmitted / submittedProposalsCount) * 100))
      : 0,
    votingPartisipation: totalVotingPeriods
      ? getNumberInBounds(0, 100, Number((satelliteVotes / totalVotingPeriods) * 100))
      : 0,
    oracleEfficiency: getNumberInBounds(0, 100, Number(oracleEfficiency)),
  }
}

export const getSatelliteOracleRecords = ({ user: { aggregator_oracles = [] } }: SatelliteRecordGraphQl) => {
  return aggregator_oracles.map(({ aggregator: { oracles, address: feedAddress }, user_id: oracleAddress }) => {
    // getting rewards for oracle per feed
    const { sMVKReward, XTZReward } = oracles.reduce(
      (acc, { rewards, user_id: rewardUserId }) => {
        rewards.forEach(({ type, reward }) => {
          if (type === 0 && rewardUserId === oracleAddress) {
            acc.XTZReward += calcWithoutMu(reward)
          }

          if (type === 1 && rewardUserId === oracleAddress) {
            acc.sMVKReward += calcWithoutPrecision(reward)
          }
        })

        return acc
      },
      {
        sMVKReward: 0,
        XTZReward: 0,
      },
    )

    return {
      feedAddress,
      oracleAddress,
      sMVKReward,
      XTZReward,
    }
  })
}

export const getSatelliteVotings = ({
  user: {
    governance_proposals_votes,
    governance_financial_requests_votes,
    governance_satellite_actions_votes,
    emergency_governance_votes,
  },
}: SatelliteRecordGraphQl) => {
  const proposalVotingHistory = governance_proposals_votes.map((vote) => {
    return {
      id: vote.id,
      proposalId: vote.governance_proposal_id,
      timestamp: new Date(vote.timestamp as string),
      vote: vote.vote,
      voterId: vote.voter_id,
      voteName: vote?.governance_proposal?.title,
      votingPower: calcWithoutPrecision(vote.voting_power),
    }
  })

  const financialRequestsVotes = governance_financial_requests_votes.map((vote) => {
    return {
      id: vote.id,
      proposalId: vote.governance_financial_request_id,
      timestamp: new Date(vote.timestamp as string),
      vote: vote.vote,
      voterId: vote.voter_id,
      voteName: vote?.governance_financial_request?.request_type,
    }
  })

  const emergencyGovernanceVotes = emergency_governance_votes.map((vote) => {
    return {
      id: vote.id,
      proposalId: vote.emergency_governance_record_id,
      timestamp: new Date(vote.timestamp as string),
      vote: 1,
      voterId: vote.voter_id,
      voteName: vote?.emergency_governance_record?.title,
    }
  })

  const satelliteActionVotes = governance_satellite_actions_votes.map((vote) => {
    return {
      id: vote.id,
      proposalId: vote.governance_satellite_action_id,
      timestamp: new Date(vote.timestamp as string),
      vote: vote.vote,
      voterId: vote.voter_id,
      voteName: vote?.governance_satellite_action?.governance_type,
    }
  })

  return {
    satelliteActionVotes,
    emergencyGovernanceVotes,
    financialRequestsVotes,
    proposalVotingHistory,
  }
}

export const normallizeSatellite = (
  satelliteRecord: SatelliteRecordGraphQl,
  metricsData: {
    pastProposals: Array<ProposalRecordType>
    proposalLedger: Array<ProposalRecordType>
    emergencyGovernanceLedger: Array<EmergergencyGovernanceItem>
    feeds: Array<Feed>
    financialRequestLedger: Array<GovernanceFinancialRequestGraphQL>
  },
) => {
  const satelliteTotalDelegatedAmount = satelliteRecord
    ? satelliteRecord.delegations.reduce((sum, current) => sum + current.user.smvk_balance, 0)
    : 0

  const satelliteOracleRecords = getSatelliteOracleRecords(satelliteRecord)
  const { proposalVotingHistory, financialRequestsVotes, emergencyGovernanceVotes, satelliteActionVotes } =
    getSatelliteVotings(satelliteRecord)

  const satelliteMetrics = getNewSatelliteMetrics({
    pastProposals: metricsData.pastProposals,
    proposalLedger: metricsData.proposalLedger,
    emergencyGovernanceLedger: metricsData.emergencyGovernanceLedger,
    feeds: metricsData.feeds,
    financialRequestLedger: metricsData.financialRequestLedger,
    satelliteAddress: satelliteRecord.user_id,
    satelliteVotings: { proposalVotingHistory, financialRequestsVotes, emergencyGovernanceVotes, satelliteActionVotes },
  })

  return {
    address: satelliteRecord.user_id,
    description: satelliteRecord.description,
    website: satelliteRecord.website,
    image: satelliteRecord.image,
    name: satelliteRecord.name,
    isSatelliteReady: satelliteRecord.currently_registered && satelliteRecord.status === 0,
    currentlyRegistered: satelliteRecord.currently_registered,
    status: satelliteRecord.status,
    delegationRatio: satelliteRecord?.delegation?.delegation_ratio / 10 ?? 0,
    delegatorCount: satelliteRecord?.delegations.length,
    satelliteFee: (satelliteRecord?.fee ?? 0) / 100,
    mvkBalance: calcWithoutPrecision(satelliteRecord?.user.mvk_balance),
    sMvkBalance: calcWithoutPrecision(satelliteRecord?.user.smvk_balance),
    totalDelegatedAmount: calcWithoutPrecision(satelliteTotalDelegatedAmount),
    accuracy: getSatelliteAccuracy(satelliteRecord),
    oracleRecords: satelliteOracleRecords,
    proposalVotingHistory,
    financialRequestsVotes,
    emergencyGovernanceVotes,
    satelliteActionVotes,
    satelliteMetrics,
  }
}

export const nomalizeSatelliteConfig = ({ delegation: [delegationInfo] }: { delegation: Array<DelegationGraphQl> }) => {
  return {
    minimumStakedMvkBalance: delegationInfo.minimum_smvk_balance ?? 0,
    satelliteNameMaxLength: delegationInfo.satellite_name_max_length ?? defaultSatelliteNameMaxLength,
    satelliteDescriptionMaxLength:
      delegationInfo.satellite_description_max_length ?? defaultSatelliteDescriptionMaxLength,
    satelliteWebsiteMaxLength: delegationInfo.satellite_website_max_length ?? defaultSatelliteWebsiteMaxLength,
  }
}

export const normalizeSatellitesLedger = (
  store: { satellite: Array<SatelliteRecordGraphQl> },
  metricsData: {
    pastProposals: Array<ProposalRecordType>
    proposalLedger: Array<ProposalRecordType>
    emergencyGovernanceLedger: Array<EmergergencyGovernanceItem>
    feeds: Array<Feed>
    financialRequestLedger: Array<GovernanceFinancialRequestGraphQL>
  },
) => {
  const normalizedSatellites = store.satellite.reduce<{
    satellitesMapper: Record<SatelliteRecordType['address'], SatelliteRecordType>
    activeSatellitesIds: Array<SatelliteRecordType['address']>
    allSatellitesIds: Array<SatelliteRecordType['address']>
    oraclesIds: Array<SatelliteRecordType['address']>
  }>(
    (acc, satelliteRecord) => {
      const nomalizedSatellite = normallizeSatellite(satelliteRecord, metricsData)
      acc.satellitesMapper[nomalizedSatellite.address] = nomalizedSatellite
      acc.allSatellitesIds.push(nomalizedSatellite.address)

      if (nomalizedSatellite.currentlyRegistered && nomalizedSatellite.status === 0) {
        acc.activeSatellitesIds.push(nomalizedSatellite.address)
      }

      if (nomalizedSatellite.oracleRecords.length) {
        acc.oraclesIds.push(nomalizedSatellite.address)
      }

      return acc
    },
    {
      satellitesMapper: {},
      activeSatellitesIds: [],
      allSatellitesIds: [],
      oraclesIds: [],
    },
  )

  return normalizedSatellites
}
