import type { SatelliteRecordType, SatelliteVotingsType } from '../../../utils/TypesAndInterfaces/Satellites'
import type { SatelliteRecordGraphQl, DelegationGraphQl } from '../../../utils/TypesAndInterfaces/Satellites'
import { GovernanceFinancialRequestGraphQL } from 'utils/TypesAndInterfaces/Governance'
import {
  Aggregator,
  Aggregator_Oracle,
  Aggregator_Oracle_Observation,
  Emergency_Governance,
  Governance_Proposal,
} from 'utils/generated/graphqlTypes'

// helpers
import { calcWithoutMu, calcWithoutPrecision, getNumberInBounds } from '../../../utils/calcFunctions'
import {
  defaultSatelliteDescriptionMaxLength,
  defaultSatelliteNameMaxLength,
  defaultSatelliteWebsiteMaxLength,
} from 'app/App.components/Input/Input.constants'
import { VOTE_NUM_MAPPER } from './Satellites.consts'

export const getSatelliteAccuracy = (satelliteRecord: SatelliteRecordGraphQl) => {
  const v1 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.aggregator?.last_completed_data),
    v2 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.observations?.[0]?.data)

  if (isNaN(v1) && isNaN(v2)) return 0

  const parsedV1 = isNaN(v1) ? 0 : v1,
    parsedv2 = isNaN(v2) ? 0 : v2
  return 100 - ((parsedV1 - parsedv2) / ((parsedV1 + parsedv2) / 2)) * 100
}

const getOraclePredictionSuccessRatio = (latestObservation?: Aggregator_Oracle_Observation): number => {
  if (!latestObservation) return 0
  const {
    epoch,
    round,
    oracle: { init_epoch, init_round },
  } = latestObservation
  return epoch / Math.max(round, 1) - init_epoch / Math.max(init_round, 1)
}

export const getNewSatelliteMetrics = ({
  proposals,
  emergencyGovernanceLedger,
  satelliteVotings: { proposalVotingHistory, emergencyGovernanceVotes, financialRequestsVotes },
  satelliteAddress,
  financialRequestLedger,
  feeds,
}: {
  proposals: Array<Governance_Proposal>
  emergencyGovernanceLedger: Array<Emergency_Governance>
  feeds: Array<Aggregator>
  financialRequestLedger: Array<GovernanceFinancialRequestGraphQL>
  satelliteVotings: SatelliteVotingsType
  satelliteAddress: string
}) => {
  /**
   * calc proposalParticipation how many times proposal that is voted by satellite has been executed
   * @submittedProposalsCount – how many proposals were executed
   * @votedProposalsSubmitted – how many executed proposal i've voted Yes
   */
  const { submittedProposalsCount, votedProposalsSubmitted } = proposals.reduce(
    (acc, { executed, id }) => {
      if (executed) {
        acc.submittedProposalsCount += 1

        const satelliteVotingData = proposalVotingHistory.find(({ proposalId }) => proposalId === id)

        if (satelliteVotingData && VOTE_NUM_MAPPER[satelliteVotingData.vote] === 'Yes') {
          acc.votedProposalsSubmitted += 1
        }
      }

      return acc
    },
    {
      submittedProposalsCount: 0,
      votedProposalsSubmitted: 0,
    },
  )
  const proposalParticipation =
    submittedProposalsCount === 0 ? 0 : (votedProposalsSubmitted / submittedProposalsCount) * 100

  /**
   * calc votingPartisipation how many votes satellite has participied
   * @satelliteVotes – how many times satellite has voted
   * @totalVotingPeriods – how many votings has been performed
   */
  const satelliteVotes = emergencyGovernanceVotes.length + proposalVotingHistory.length + financialRequestsVotes.length
  const totalVotingPeriods = emergencyGovernanceLedger.length + financialRequestLedger.length + proposals.length
  const votingPartisipation = totalVotingPeriods === 0 ? 0 : (satelliteVotes / totalVotingPeriods) * 100

  /**
   * calc how satellite predicts feed price
   * @observationsForSatellite – oracles predictions
   * @numberOfObservations – amount of oracle's predictions
   * @epochRoundRatio – success of the predictions?
   */
  const observationsForSatellite = feeds
    .reduce<Aggregator_Oracle['observations']>((acc, { oracles }) => {
      const filteredSatellitesObservations = oracles
        .map(({ observations }) => observations)
        .flat()
        .filter(({ oracle: { user_id } }) => user_id === satelliteAddress)
      return acc.concat(filteredSatellitesObservations)
    }, [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const latestObservation = observationsForSatellite[0]
  const numberOfObservations = observationsForSatellite.length
  const epochRoundRatio = getOraclePredictionSuccessRatio(latestObservation)
  const oracleEfficiency = (numberOfObservations / Math.max(epochRoundRatio, 1)) * 100

  return {
    proposalParticipation: getNumberInBounds(0, 100, proposalParticipation),
    votingPartisipation: getNumberInBounds(0, 100, votingPartisipation),
    oracleEfficiency: getNumberInBounds(0, 100, oracleEfficiency),
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
    proposals: Array<Governance_Proposal>
    emergencyGovernanceLedger: Array<Emergency_Governance>
    feeds: Array<Aggregator>
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
    ...metricsData,
    satelliteAddress: satelliteRecord.user_id,
    satelliteVotings: { proposalVotingHistory, financialRequestsVotes, emergencyGovernanceVotes, satelliteActionVotes },
  })

  return {
    address: satelliteRecord.user_id,
    description: satelliteRecord.description,
    website: satelliteRecord.website,
    image: satelliteRecord.image,
    name: satelliteRecord.name,
    peerId: satelliteRecord?.peer_id ?? '',
    publicKey: satelliteRecord?.public_key ?? '',
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
    minimumStakedMvkBalance: calcWithoutPrecision(delegationInfo.minimum_smvk_balance),
    satelliteNameMaxLength: delegationInfo.satellite_name_max_length ?? defaultSatelliteNameMaxLength,
    satelliteDescriptionMaxLength:
      delegationInfo.satellite_description_max_length ?? defaultSatelliteDescriptionMaxLength,
    satelliteWebsiteMaxLength: delegationInfo.satellite_website_max_length ?? defaultSatelliteWebsiteMaxLength,
  }
}

export const normalizeSatellitesLedger = (store: {
  satellite: Array<SatelliteRecordGraphQl>
  governance_proposal: Array<Governance_Proposal>
  emergency_governance: Array<Emergency_Governance>
  aggregator: Array<Aggregator>
  governance_financial_request: Array<GovernanceFinancialRequestGraphQL>
}) => {
  const normalizedSatellites = store.satellite.reduce<{
    satellitesMapper: Record<SatelliteRecordType['address'], SatelliteRecordType>
    activeSatellitesIds: Array<SatelliteRecordType['address']>
    allSatellitesIds: Array<SatelliteRecordType['address']>
    oraclesIds: Array<SatelliteRecordType['address']>
  }>(
    (acc, satelliteRecord) => {
      const nomalizedSatellite = normallizeSatellite(satelliteRecord, {
        proposals: store.governance_proposal,
        emergencyGovernanceLedger: store.emergency_governance,
        feeds: store.aggregator,
        financialRequestLedger: store.governance_financial_request,
      })
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
