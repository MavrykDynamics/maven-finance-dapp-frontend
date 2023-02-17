import { MichelsonMap } from '@taquito/taquito'
// types
import type {
  DelegateRecord,
  NewSatelliteRecordType,
  NewSatelliteVotingsType,
  SatelliteRecord,
} from '../../utils/TypesAndInterfaces/Delegation'
import type { MavrykUserGraphQl } from '../../utils/TypesAndInterfaces/User'
import type { SatelliteRecordGraphQl, DelegationGraphQl } from '../../utils/TypesAndInterfaces/Delegation'
import {
  FinancialRequestRecord,
  GovernanceFinancialRequestGraphQL,
  ProposalRecordType,
} from 'utils/TypesAndInterfaces/Governance'
import { EmergergencyGovernanceItem } from 'utils/TypesAndInterfaces/EmergencyGovernance'

// helpers
import { calcWithoutMu, calcWithoutPrecision } from '../../utils/calcFunctions'
import { Aggregator_Oracle } from 'utils/generated/graphqlTypes'
import {
  defaultSatelliteDescriptionMaxLength,
  defaultSatelliteImageMaxLength,
  defaultSatelliteNameMaxLength,
  defaultSatelliteWebsiteMaxLength,
} from 'app/App.components/Input/Input.constants'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

// TODO: add new satelltie type instead of any
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
  satelliteVotings: NewSatelliteVotingsType
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
      ? Math.max(0, Math.min(100, Number((votedProposalSubmitted / submittedProposalsCount) * 100)))
      : 0,
    votingPartisipation: totalVotingPeriods
      ? Math.max(0, Math.min(100, Number((satelliteVotes / totalVotingPeriods) * 100)))
      : 0,
    oracleEfficiency: Math.max(0, Math.min(100, Number(oracleEfficiency))),
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
      proposalId: vote.governance_proposal_id || 0,
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
      proposalId: vote.governance_financial_request_id || 0,
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
      proposalId: vote.governance_satellite_action_id || 0,
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
  const normalizedSatellites = store.satellite.reduce<
    Record<NewSatelliteRecordType['address'], NewSatelliteRecordType>
  >((acc, satelliteRecord) => {
    acc[satelliteRecord.user_id] = normallizeSatellite(satelliteRecord, metricsData)
    return acc
  }, {})

  return normalizedSatellites
}

export function normalizeSatelliteRecord(
  satelliteRecord: SatelliteRecordGraphQl,
  userVotingHistory: MavrykUserGraphQl,
) {
  const totalDelegatedAmount = satelliteRecord
    ? satelliteRecord.delegations.reduce(
        (sum: number, current: { user: { smvk_balance: number } }) => sum + current.user.smvk_balance,
        0,
      )
    : 0

  const proposalVotingHistory = userVotingHistory
    ? userVotingHistory?.governance_proposals_votes?.map((vote) => {
        return {
          id: vote.id,
          currentRoundVote: vote.current_round_vote,
          proposalId: vote.governance_proposal_id || 0,
          round: vote.round,
          timestamp: new Date(vote.timestamp as string),
          vote: vote.vote,
          voterId: vote.voter_id,
          votingPower: calcWithoutPrecision(vote.voting_power),
          requestData: vote.governance_proposal,
          voteName: vote?.governance_proposal?.title,
          submitted: vote.governance_proposal?.executed && vote.governance_proposal.locked,
        }
      })
    : []

  const financialRequestsVotes = userVotingHistory
    ? userVotingHistory.governance_financial_requests_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.governance_financial_request_id || 0,
          timestamp: new Date(vote.timestamp as string),
          vote: vote.vote,
          voterId: vote.voter_id,
          requestData: vote.governance_financial_request,
          voteName: vote?.governance_financial_request?.request_type,
        }
      })
    : []

  const emergencyGovernanceVotes = userVotingHistory
    ? userVotingHistory.emergency_governance_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.emergency_governance_record_id,
          timestamp: new Date(vote.timestamp as string),
          vote: 1,
          voterId: vote.voter_id,
          voteName: vote?.emergency_governance_record?.title,
        }
      })
    : []

  const satelliteActionVotes = userVotingHistory
    ? userVotingHistory.governance_satellite_actions_votes?.map((vote) => {
        return {
          id: vote.id,
          proposalId: vote.governance_satellite_action_id || 0,
          timestamp: new Date(vote.timestamp as string),
          vote: vote.vote,
          voterId: vote.voter_id,
          voteName: vote?.governance_satellite_action?.governance_type,
        }
      })
    : []

  const oracleRecords = (satelliteRecord?.user?.aggregator_oracles || []).map(
    ({ aggregator: { oracles, address: feedAddress }, user_id: oracleAddress }) => {
      // getting rewards for oracle per feed
      const { sMVKReward, XTZReward } = oracles.reduce(
        (acc, { rewards, user_id: rewardUserId }) => {
          rewards.forEach(({ type, reward }) => {
            if (type === 0 && rewardUserId === oracleAddress) {
              acc.XTZReward += reward / 10 ** 6
            }

            if (type === 1 && rewardUserId === oracleAddress) {
              acc.sMVKReward += reward / 10 ** 9
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
    },
  )

  const v1 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.aggregator?.last_completed_data)
  const v2 = Number(satelliteRecord.user.aggregator_oracles?.[0]?.observations?.[0]?.data)
  const accuracy = 100 - ((v1 - v2) / ((v1 + v2) / 2)) * 100

  const newSatelliteRecord = {
    address: satelliteRecord?.user_id || '',
    oracleRecords,
    description: satelliteRecord?.description || '',
    website: satelliteRecord?.website || '',
    participation: 0,
    image: satelliteRecord?.image || '',
    mvkBalance: calcWithoutPrecision(satelliteRecord?.user.mvk_balance),
    sMvkBalance: calcWithoutPrecision(satelliteRecord?.user.smvk_balance),
    name: satelliteRecord?.name || '',
    satelliteFee: (satelliteRecord?.fee || 0) / 100,
    status: satelliteRecord?.status,
    delegationRatio: satelliteRecord?.delegation?.delegation_ratio / 10 ?? 0,
    delegatorCount: satelliteRecord?.delegations.length,
    totalDelegatedAmount: calcWithoutPrecision(totalDelegatedAmount),
    proposalVotingHistory,
    financialRequestsVotes,
    emergencyGovernanceVotes,
    satelliteActionVotes,
    currentlyRegistered: satelliteRecord.currently_registered,
    isSatelliteReady: satelliteRecord.currently_registered && satelliteRecord.status === 0,
    accuracy,
  }

  return newSatelliteRecord
}

function convertToSatelliteRecords(satelliteRecordList: DelegationGraphQl['satellites']): {
  ledger: SatelliteRecord[]
  activeSatellites: SatelliteRecord[]
} {
  const ledger = satelliteRecordList?.length
    ? satelliteRecordList.map((item) => normalizeSatelliteRecord(item, item?.user))
    : []
  return {
    ledger,
    activeSatellites: ledger.filter(({ currentlyRegistered, status }) => currentlyRegistered && status === 0),
  }
}

function getOraclesAmount(satellites: SatelliteRecord[]) {
  return satellites.reduce((acc, { oracleRecords }) => {
    if (oracleRecords.length) {
      acc += 1
    }
    return acc
  }, 0)
}

export function normalizeDelegationStorage(delegationStorage: DelegationGraphQl) {
  const { ledger, activeSatellites } = convertToSatelliteRecords(delegationStorage?.satellites)

  return {
    breakGlassConfig: {
      delegateToSatelliteIsPaused: delegationStorage?.delegate_to_satellite_paused,
      undelegateFromSatelliteIsPaused: delegationStorage?.undelegate_from_satellite_paused,
      registerAsSatelliteIsPaused: delegationStorage?.register_as_satellite_paused,
      unregisterAsSatelliteIsPaused: delegationStorage?.unregister_as_satellite_paused,
      updateSatelliteRecordIsPaused: delegationStorage?.update_satellite_record_paused,
      distributeRewardPaused: delegationStorage?.distribute_reward_paused,
    },
    config: {
      maxSatellites: delegationStorage?.max_satellites,
      delegationRatio: delegationStorage?.delegation_ratio,
      minimumStakedMvkBalance: calcWithoutPrecision(delegationStorage?.minimum_smvk_balance),
      satelliteNameMaxLength: delegationStorage?.satellite_name_max_length || defaultSatelliteNameMaxLength,
      satelliteDescriptionMaxLength:
        delegationStorage?.satellite_description_max_length || defaultSatelliteDescriptionMaxLength,
      satelliteImageMaxLength: delegationStorage?.satellite_image_max_length || defaultSatelliteImageMaxLength,
      satelliteWebsiteMaxLength: delegationStorage?.satellite_website_max_length || defaultSatelliteWebsiteMaxLength,
    },
    delegateLedger: new MichelsonMap<string, DelegateRecord>(),
    satelliteLedger: ledger,
    activeSatellites,
    oraclesAmount: getOraclesAmount(ledger),
    numberActiveSatellites: delegationStorage?.max_satellites,
    totalDelegatedMVK: delegationStorage?.max_satellites,
  }
}

export const getSatelliteMetrics = (
  pastProposals: Array<ProposalRecordType>,
  proposalLedger: Array<ProposalRecordType>,
  emergencyGovernanceLedger: Array<EmergergencyGovernanceItem>,
  satellite: SatelliteRecord,
  feeds?: Array<Feed>,
  financialRequestLedger?: Array<GovernanceFinancialRequestGraphQL>,
) => {
  const submittedProposalsCount = pastProposals
    .concat(proposalLedger)
    .reduce((acc, { locked, executed }) => (acc += locked && executed ? 1 : 0), 0)
  const totalVotingPeriods =
    (emergencyGovernanceLedger.length ?? 0) +
    (financialRequestLedger?.length ?? 0) +
    (proposalLedger.length ?? 0) +
    (pastProposals.length ?? 0)

  const votedProposalSubmitted =
    satellite.proposalVotingHistory?.reduce((acc, { submitted }) => (submitted ? (acc += 1) : acc), 0) ?? 0
  const satelliteVotes =
    (satellite.emergencyGovernanceVotes?.length ?? 0) +
    (satellite.satelliteActionVotes?.length ?? 0) +
    (satellite.proposalVotingHistory?.length ?? 0) +
    (satellite.financialRequestsVotes?.length ?? 0)

  const observationsForSatellite = feeds
    ?.reduce<Aggregator_Oracle['observations']>(
      (acc, { oracles }) => acc.concat(...oracles.map(({ observations }) => observations)),
      [],
    )
    ?.filter(({ oracle: { user_id } }) => user_id === satellite.address)
    ?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const latestObservation = observationsForSatellite?.[0]
  const numberOfObservations = observationsForSatellite?.length ?? 0
  const epochRoundRatio =
    (latestObservation?.epoch ?? 0) / (latestObservation?.round || 1) -
    (latestObservation?.oracle?.init_epoch ?? 0) / (latestObservation?.oracle?.init_round || 1)
  const oracleEfficiency = (numberOfObservations / Math.max(epochRoundRatio, 1)) * 100

  return {
    proposalParticipation: submittedProposalsCount
      ? Math.max(0, Math.min(100, Number((votedProposalSubmitted / submittedProposalsCount) * 100)))
      : 0,
    votingPartisipation: totalVotingPeriods
      ? Math.max(0, Math.min(100, Number((satelliteVotes / totalVotingPeriods) * 100)))
      : 0,
    oracleEfficiency: Math.max(0, Math.min(100, Number(oracleEfficiency))),
  }
}

export const getVoteText = (voteType?: number): string => {
  if (voteType === 0) return 'Pass'
  if (voteType === 1) return 'Yes'
  if (voteType === 2) return 'No'

  return ''
}
