import type { SatelliteVotingsType } from '../../../utils/TypesAndInterfaces/Satellites'

// helpers
import { calcWithoutMu, calcWithoutPrecision, getNumberInBounds } from '../../../utils/calcFunctions'
import { OracleStatusTypes, VOTE_NUM_MAPPER } from '../satellites.const'
import { SatellitesStorage } from '../satellites.provider.types'
import {
  SatelliteDataSubscription,
  SatelliteGovernanceProposalDataSubscription,
  SatelliteEmergencyGovernanceDataSubscription,
  SatelliteGovernanceFinancialRequestSubscription,
  SatelliteAggregatorOraclesSubscription,
} from 'utils/__generated__/graphql'

export const getSatelliteAccuracy = (satelliteRecord: SatelliteDataSubscription['satellite'][0]) => {
  const v1 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.aggregator?.last_completed_data),
    v2 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.observations?.[0]?.data)

  if (isNaN(v1) && isNaN(v2)) return 0

  const parsedV1 = isNaN(v1) ? 0 : v1,
    parsedv2 = isNaN(v2) ? 0 : v2
  return 100 - ((parsedV1 - parsedv2) / ((parsedV1 + parsedv2) / 2)) * 100
}

const getOraclePredictionSuccessRatio = (
  latestObservation?: SatelliteAggregatorOraclesSubscription['aggregator'][0]['oracles'][0]['observations'][0],
): number => {
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
  // proposals: SatelliteGovernanceProposalDataSubscription['governance_proposal']
  //   emergencyGovernanceLedger: SatelliteEmergencyGovernanceDataSubscription['emergency_governance']
  //   feeds: SatelliteAggregatorOraclesSubscription['aggregator']
  //   financialRequestLedger: SatelliteGovernanceFinancialRequestSubscription['governance_financial_request']

  proposals: SatelliteGovernanceProposalDataSubscription['governance_proposal']
  emergencyGovernanceLedger: SatelliteEmergencyGovernanceDataSubscription['emergency_governance']
  feeds: SatelliteAggregatorOraclesSubscription['aggregator']
  financialRequestLedger: SatelliteGovernanceFinancialRequestSubscription['governance_financial_request']
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
    .reduce(
      (acc: SatelliteAggregatorOraclesSubscription['aggregator'][0]['oracles'][0]['observations'], { oracles }) => {
        const filteredSatellitesObservations = oracles
          .map(({ observations }) => observations)
          .flat()
          .filter(({ oracle: { user_id } }) => user_id === satelliteAddress)
        return acc.concat(filteredSatellitesObservations)
      },
      [],
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const latestObservation = observationsForSatellite[0]
  const numberOfObservations = feeds.reduce((acc, f) => {
    acc += f.oracles[0].observations_aggregate.aggregate?.count ?? 0
    return acc
  }, 0)
  const epochRoundRatio = getOraclePredictionSuccessRatio(latestObservation)
  const oracleEfficiency = (numberOfObservations / Math.max(epochRoundRatio, 1)) * 100

  return {
    proposalParticipation: getNumberInBounds(0, 100, proposalParticipation),
    votingPartisipation: getNumberInBounds(0, 100, votingPartisipation),
    oracleEfficiency: getNumberInBounds(0, 100, oracleEfficiency),
  }
}

export const getSatelliteOracleRecords = ({
  user: { aggregator_oracles = [] },
}: SatelliteDataSubscription['satellite'][0]) => {
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
}: SatelliteDataSubscription['satellite'][0]) => {
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
  satelliteRecord: SatelliteDataSubscription['satellite'][0],
  metricsData: {
    proposals: SatelliteGovernanceProposalDataSubscription['governance_proposal']
    emergencyGovernanceLedger: SatelliteEmergencyGovernanceDataSubscription['emergency_governance']
    feeds: SatelliteAggregatorOraclesSubscription['aggregator']
    financialRequestLedger: SatelliteGovernanceFinancialRequestSubscription['governance_financial_request']
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

  // Getting oracle status
  let oracleStatus: OracleStatusTypes = 'notAnOracle'

  // check if satellite is an oracle
  if (satelliteOracleRecords?.length > 0) {
    // check whether oracle is active, if true status can be responded or awaiting
    if (satelliteRecord.status === 0) {
      const currentOracleFeeds = metricsData.feeds.filter(
        ({ admin }) => satelliteOracleRecords[0].oracleAddress === admin,
      )

      // if timestamp or all feeds from this satellite is >= than 30m ago, feed is not active, if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
      if (
        currentOracleFeeds.every(
          ({ last_completed_data_last_updated_at, heart_beat_seconds }) =>
            (Number(Date.now()) - Number(new Date(last_completed_data_last_updated_at || Date.now()))) / 1000 >=
            heart_beat_seconds,
        )
      ) {
        oracleStatus = 'responded'
      } else {
        oracleStatus = 'awaiting'
      }
      // if oracle is not active, status should be "no response"
    } else {
      oracleStatus = 'noResponse'
    }
  }

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
    oracleStatus,
  }
}

export const normalizeSatellitesLedger = (store: SatellitesStorage) => {
  const normalizedSatellites = store.satellite.reduce<{
    satelliteMapper: Record<string, SatelliteDataSubscription['satellite'][0]>
    activeSatellitesIds: string[]
    allSatellitesIds: string[]
    oraclesIds: string[]
  }>(
    (acc, satelliteRecord) => {
      const nomalizedSatellite = normallizeSatellite(satelliteRecord, {
        proposals: store.governance_proposal,
        emergencyGovernanceLedger: store.emergency_governance,
        feeds: store.aggregator,
        financialRequestLedger: store.governance_financial_request,
      }) as any
      acc.satelliteMapper[nomalizedSatellite.address] = nomalizedSatellite
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
      satelliteMapper: {},
      activeSatellitesIds: [],
      allSatellitesIds: [],
      oraclesIds: [],
    },
  )

  return normalizedSatellites
}
