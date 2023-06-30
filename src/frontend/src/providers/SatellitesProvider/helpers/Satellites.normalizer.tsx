import type {
  SatelliteIndexerStatusType,
  SatelliteRecordType,
  SatelliteVotingsType,
} from 'providers/SatellitesProvider/satellites.provider.types'

// helpers
import { convertNumberForClient, getNumberInBounds } from '../../../utils/calcFunctions'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'
import { MVK_DECIMALS, XTZ_DECIMALS } from 'utils/constants'
import { VOTE_NUM_MAPPER } from '../satellites.const'

// const getOraclePredictionSuccessRatio = (
//   latestObservation?: SatelliteAggregatorOraclesSubscription['aggregator'][0]['oracles'][0]['observations'][0],
// ): number => {
//   if (!latestObservation) return 0
//   const {
//     epoch,
//     round,
//     oracle: { init_epoch, init_round },
//   } = latestObservation
//   return epoch / Math.max(round, 1) - init_epoch / Math.max(init_round, 1)
// }

// export const getNewSatelliteMetrics = ({
//   proposals,
//   emergencyGovernanceLedger,
//   satelliteVotings: { proposalVotingHistory, emergencyGovernanceVotes, financialRequestsVotes },
//   satelliteAddress,
//   financialRequestLedger,
//   feeds,
// }: {
//   proposals: SatelliteGovernanceProposalDataSubscription['governance_proposal']
//   emergencyGovernanceLedger: SatelliteEmergencyGovernanceDataSubscription['emergency_governance']
//   feeds: SatelliteAggregatorOraclesSubscription['aggregator']
//   financialRequestLedger: SatelliteGovernanceFinancialRequestSubscription['governance_financial_request']
//   satelliteVotings: SatelliteVotingsType
//   satelliteAddress: string
// }) => {
//   /**
//    * calc proposalParticipation how many times proposal that is voted by satellite has been executed
//    * @submittedProposalsCount – how many proposals were executed
//    * @votedProposalsSubmitted – how many executed proposal i've voted Yes
//    */
//   const { submittedProposalsCount, votedProposalsSubmitted } = proposals.reduce(
//     (acc, { executed, id }) => {
//       if (executed) {
//         acc.submittedProposalsCount += 1

//         const satelliteVotingData = proposalVotingHistory.find(({ proposalId }) => proposalId === id)

//         if (satelliteVotingData && VOTE_NUM_MAPPER[satelliteVotingData.vote] === 'Yes') {
//           acc.votedProposalsSubmitted += 1
//         }
//       }

//       return acc
//     },
//     {
//       submittedProposalsCount: 0,
//       votedProposalsSubmitted: 0,
//     },
//   )
//   const proposalParticipation =
//     submittedProposalsCount === 0 ? 0 : (votedProposalsSubmitted / submittedProposalsCount) * 100

//   /**
//    * calc votingPartisipation how many votes satellite has participied
//    * @satelliteVotes – how many times satellite has voted
//    * @totalVotingPeriods – how many votings has been performed
//    */
//   const satelliteVotes = emergencyGovernanceVotes.length + proposalVotingHistory.length + financialRequestsVotes.length
//   const totalVotingPeriods = emergencyGovernanceLedger.length + financialRequestLedger.length + proposals.length
//   const votingPartisipation = totalVotingPeriods === 0 ? 0 : (satelliteVotes / totalVotingPeriods) * 100

//   /**
//    * calc how satellite predicts feed price
//    * @observationsForSatellite – oracles predictions
//    * @numberOfObservations – amount of oracle's predictions
//    * @epochRoundRatio – success of the predictions?
//    */
//   const observationsForSatellite = feeds
//     .reduce(
//       (acc: SatelliteAggregatorOraclesSubscription['aggregator'][0]['oracles'][0]['observations'], { oracles }) => {
//         const filteredSatellitesObservations = oracles
//           .map(({ observations }) => observations)
//           .flat()
//           .filter(({ oracle: { user_id } }) => user_id === satelliteAddress)
//         return acc.concat(filteredSatellitesObservations)
//       },
//       [],
//     )
//     .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

//   const latestObservation = observationsForSatellite[0]
//   const numberOfObservations = feeds.reduce((acc, f) => {
//     acc += f.oracles[0].observations_aggregate.aggregate?.count ?? 0
//     return acc
//   }, 0)
//   const epochRoundRatio = getOraclePredictionSuccessRatio(latestObservation)
//   const oracleEfficiency = (numberOfObservations / Math.max(epochRoundRatio, 1)) * 100

//   return {
//     proposalParticipation: getNumberInBounds(0, 100, proposalParticipation),
//     votingPartisipation: getNumberInBounds(0, 100, votingPartisipation),
//     oracleEfficiency: getNumberInBounds(0, 100, oracleEfficiency),
//   }
// }

export const getSatelliteOracleRecords = (
  satelliteOracles: SatelliteDataSubSubscription['satellite'][number]['user']['aggregator_oracles'],
) => {
  return satelliteOracles.map(({ aggregator: { oracles, address: feedAddress } }) => {
    // getting rewards for oracle per feed
    const { sMVKReward, XTZReward } = oracles.reduce(
      (acc, { rewards }) => {
        rewards.forEach(({ type, reward }) => {
          if (type === 0) {
            acc.XTZReward += convertNumberForClient({ number: reward, grade: XTZ_DECIMALS })
          }

          if (type === 1) {
            acc.sMVKReward += convertNumberForClient({ number: reward, grade: MVK_DECIMALS })
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
      sMVKReward,
      XTZReward,
    }
  })
}

export const getSatelliteVotings = ({
  governance_proposals_votes,
  governance_financial_requests_votes,
  governance_satellite_actions_votes,
  emergency_governance_votes,
}: SatelliteDataSubSubscription['satellite'][0]['user']) => {
  let executedVotedProposalsAmount = 0
  const proposalsVotes = governance_proposals_votes.map((vote) => {
    if (vote?.governance_proposal.executed && VOTE_NUM_MAPPER[vote.vote] === 'Yes') executedVotedProposalsAmount += 1
    return {
      id: vote.id,
      timestamp: new Date(vote.timestamp as string),
      vote: vote.vote,
      voteName: vote?.governance_proposal?.title,
    }
  })

  const financialRequestsVotes = governance_financial_requests_votes.map((vote) => {
    return {
      id: vote.id,
      timestamp: new Date(vote.timestamp as string),
      vote: vote.vote,
      voteName: vote?.governance_financial_request?.request_type,
    }
  })

  const satelliteActionVotes = governance_satellite_actions_votes.map((vote) => {
    return {
      id: vote.id,
      timestamp: new Date(vote.timestamp as string),
      vote: vote.vote,
      voteName: vote?.governance_satellite_action?.governance_type,
    }
  })

  const eGovVotes = emergency_governance_votes.map((vote) => {
    return {
      id: vote.id,
      timestamp: new Date(vote.timestamp as string),
      vote: 1,
      voteName: vote?.emergency_governance_record?.title,
    }
  })

  return {
    satelliteActionVotes,
    eGovVotes,
    financialRequestsVotes,
    proposalsVotes,
    executedVotedProposalsAmount,
  }
}

export const normallizeSatellite = (satelliteRecord: SatelliteDataSubSubscription['satellite'][0]) => {
  const satelliteAddress = satelliteRecord.user.address
  const satelliteUser = satelliteRecord.user
  const lastVotedProposal = satelliteUser.governance_proposals_votes[0]

  const satelliteTotalDelegatedAmount = satelliteRecord
    ? satelliteRecord.delegations.reduce((sum, current) => sum + current.user.smvk_balance, 0)
    : 0

  const totalVotingPower =
    satelliteUser.governance_satellite_snapshots[0].cycle ===
    satelliteUser.governance_satellite_snapshots[0].governance.cycle_id
      ? satelliteUser.governance_satellite_snapshots[0].total_voting_power
      : 0

  const { proposalsVotes, financialRequestsVotes, satelliteActionVotes, eGovVotes, executedVotedProposalsAmount } =
    getSatelliteVotings(satelliteUser)

  return {
    // satellite metadata
    address: satelliteAddress,
    description: satelliteRecord.description,
    website: satelliteRecord.website,
    image: satelliteRecord.image,
    name: satelliteRecord.name,
    status: satelliteRecord.status as SatelliteIndexerStatusType,

    // oracles data
    peerId: satelliteRecord?.peer_id ?? '',
    publicKey: satelliteRecord?.public_key ?? '',

    // registration status
    isSatelliteReady: satelliteRecord.currently_registered && satelliteRecord.status === 0,
    currentlyRegistered: satelliteRecord.currently_registered,

    // delegation data
    delegationRatio: satelliteRecord?.delegation?.delegation_ratio / 10 ?? 0,
    delegatorCount: satelliteRecord?.delegations.length,
    satelliteFee: (satelliteRecord?.fee ?? 0) / 100,
    totalDelegatedAmount: convertNumberForClient({ number: satelliteTotalDelegatedAmount, grade: MVK_DECIMALS }),

    mvkBalance: convertNumberForClient({ number: satelliteRecord?.user.mvk_balance, grade: MVK_DECIMALS }),
    sMvkBalance: convertNumberForClient({ number: satelliteRecord?.user.smvk_balance, grade: MVK_DECIMALS }),
    oracleRecords: getSatelliteOracleRecords(satelliteUser['aggregator_oracles']),

    // votes & voting metrix
    lastVotedProposal: {
      vote: lastVotedProposal.vote,
      proposalTitle: lastVotedProposal.governance_proposal.title,
      proposalId: lastVotedProposal.governance_proposal.id,
    },
    proposalsVotes,
    financialRequestsVotes,
    satelliteActionVotes,
    eGovVotes,
    executedVotedProposalsAmount,
    totalVotingPower,
  }
}

export const normalizeSatellitesLedger = (
  store: SatelliteDataSubSubscription,
): {
  satelliteMapper: Record<string, ReturnType<typeof normallizeSatellite>>
  activeSatellitesIds: string[]
  allSatellitesIds: string[]
  oraclesIds: string[]
} => {
  const normalizedSatellites = store.satellite.reduce<{
    satelliteMapper: Record<string, ReturnType<typeof normallizeSatellite>>
    activeSatellitesIds: string[]
    allSatellitesIds: string[]
    oraclesIds: string[]
  }>(
    (acc, satelliteRecord) => {
      const nomalizedSatellite = normallizeSatellite(satelliteRecord)
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
