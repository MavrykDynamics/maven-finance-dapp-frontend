import dayjs from 'dayjs'

import {
  SATELLITE_VOTE_YES,
  satelliteStatusSchema,
  satelliteVoteSchema,
  SatelliteVoteItemType,
  SatelliteRecordType,
} from 'providers/SatellitesProvider/satellites.provider.types'

// helpers
import { calcPersent, convertNumberForClient } from '../../../utils/calcFunctions'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'
import { MVK_DECIMALS, XTZ_DECIMALS } from 'utils/constants'

const getSatelliteOracleRewards = (
  satelliteOracleData: SatelliteDataSubSubscription['satellite'][number]['user']['aggregator_oracles'],
) => {
  return satelliteOracleData.reduce<{
    sMVKRewards: number
    XTZRewards: number
    participatedFeeds: Record<
      string,
      {
        averagePredict: number
      }
    >
  }>(
    (
      acc,
      {
        smvkRewardsAmount,
        xtzRewardsAmount,
        aggregator: { address: feedAddress },
        observations_aggregate: { aggregate },
      },
    ) => {
      acc.XTZRewards += convertNumberForClient({
        number: xtzRewardsAmount.aggregate?.sum?.reward ?? 0,
        grade: XTZ_DECIMALS,
      })
      acc.sMVKRewards += convertNumberForClient({
        number: smvkRewardsAmount.aggregate?.sum?.reward ?? 0,
        grade: MVK_DECIMALS,
      })
      acc.participatedFeeds[feedAddress] = {
        averagePredict: Number(aggregate?.sum?.data) / Math.max(Number(aggregate?.count) ?? 1, 1),
      }
      return acc
    },
    {
      sMVKRewards: 0,
      XTZRewards: 0,
      participatedFeeds: {},
    },
  )
}

const getSatelliteOracleEfficiency = (satelliteUser: SatelliteDataSubSubscription['satellite'][number]['user']) => {
  const { aggregator_oracles, feedsObservationsAmount } = satelliteUser

  const latestObservation = aggregator_oracles.reduce(
    (acc, { init_epoch, init_round, observations: [lastFeedObservation] }) => {
      const { timestamp, epoch, round } = lastFeedObservation

      if (dayjs(timestamp).unix() > acc.latestTimestamp) {
        acc.init_epoch = init_epoch
        acc.init_round = init_round
        acc.epoch = epoch
        acc.round = round
        acc.latestTimestamp = timestamp
      }
      return acc
    },
    {
      init_epoch: 0,
      init_round: 0,
      epoch: 0,
      round: 0,
      latestTimestamp: 0,
    },
  )

  if (!latestObservation) return 0

  const totalFeedsObservation = feedsObservationsAmount.nodes.reduce(
    (acc, { observations_aggregate: { aggregate } }) => (acc += aggregate?.count ?? 0),
    0,
  )

  const { epoch, round, init_epoch, init_round } = latestObservation
  const predictionSuccessRatio = epoch / Math.max(round, 1) - init_epoch / Math.max(init_round, 1)

  return calcPersent(predictionSuccessRatio, totalFeedsObservation)
}

const getSatelliteVotings = ({
  governance_proposals_votes,
  governance_financial_requests_votes,
  governance_satellite_actions_votes,
  emergency_governance_votes,
}: SatelliteDataSubSubscription['satellite'][0]['user']) => {
  let executedVotedProposalsAmount = 0
  const proposalsVotes = governance_proposals_votes.reduce<Array<SatelliteVoteItemType>>((acc, vote) => {
    try {
      const voteValue = satelliteVoteSchema.parse(vote.vote)

      if (vote.governance_proposal.executed && voteValue === SATELLITE_VOTE_YES) executedVotedProposalsAmount += 1

      acc.push({
        id: vote.id,
        timestamp: dayjs(vote.timestamp).unix(),
        vote: voteValue,
        voteName: vote.governance_proposal.title,
      })
    } catch (e) {
      console.error('emergency_governance_votes vote parse error: ', { e })
    } finally {
      return acc
    }
  }, [])

  const financialRequestsVotes = governance_financial_requests_votes.reduce<Array<SatelliteVoteItemType>>(
    (acc, vote) => {
      try {
        const voteValue = satelliteVoteSchema.parse(vote.vote)
        acc.push({
          id: vote.id,
          timestamp: dayjs(vote.timestamp).unix(),
          vote: voteValue,
          voteName: vote.governance_financial_request.request_type,
        })
      } catch (e) {
        console.error('emergency_governance_votes vote parse error: ', { e })
      } finally {
        return acc
      }
    },
    [],
  )

  const satelliteActionVotes = governance_satellite_actions_votes.reduce<Array<SatelliteVoteItemType>>((acc, vote) => {
    try {
      const voteValue = satelliteVoteSchema.parse(vote.vote)
      acc.push({
        id: vote.id,
        timestamp: dayjs(vote.timestamp).unix(),
        vote: voteValue,
        voteName: vote.governance_satellite_action.governance_type,
      })
    } catch (e) {
      console.error('emergency_governance_votes vote parse error: ', { e })
    } finally {
      return acc
    }
  }, [])

  const eGovVotes = emergency_governance_votes.reduce<Array<SatelliteVoteItemType>>((acc, vote) => {
    try {
      const voteValue = satelliteVoteSchema.parse(1)
      acc.push({
        id: vote.id,
        timestamp: dayjs(vote.timestamp).unix(),
        vote: voteValue,
        voteName: vote.emergency_governance_record.title,
      })
    } catch (e) {
      console.error('emergency_governance_votes vote parse error: ', { e })
    } finally {
      return acc
    }
  }, [])

  return {
    satelliteActionVotes,
    eGovVotes,
    financialRequestsVotes,
    proposalsVotes,
    executedVotedProposalsAmount,
  }
}

export const normallizeSatellite = (satelliteRecord: SatelliteDataSubSubscription['satellite'][0]) => {
  try {
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
    const { sMVKRewards, XTZRewards, participatedFeeds } = getSatelliteOracleRewards(
      satelliteUser['aggregator_oracles'],
    )

    const satelliteStatus = satelliteStatusSchema.parse(satelliteRecord.status)

    return {
      // satellite metadata
      address: satelliteAddress,
      description: satelliteRecord.description,
      website: satelliteRecord.website,
      image: satelliteRecord.image,
      name: satelliteRecord.name,
      status: satelliteStatus,

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
      sMVKRewards,
      XTZRewards,
      participatedFeeds,
      oracleEfficiency: getSatelliteOracleEfficiency(satelliteUser),

      // votes & voting metrix
      lastVotedProposal: lastVotedProposal
        ? {
            vote: lastVotedProposal.vote,
            proposalTitle: lastVotedProposal.governance_proposal.title,
            proposalId: lastVotedProposal.governance_proposal.id,
          }
        : null,
      proposalsVotes,
      financialRequestsVotes,
      satelliteActionVotes,
      eGovVotes,
      executedVotedProposalsAmount,
      totalVotingPower,
    }
  } catch (e) {
    console.error('normallizeSatellite parsing error: ', { e })
    return null
  }
}

export const normalizeSatellitesLedger = (store: SatelliteDataSubSubscription) => {
  return store.satellite.reduce<{
    satelliteMapper: Record<string, SatelliteRecordType>
    activeSatellitesIds: string[]
    allSatellitesIds: string[]
    oraclesIds: string[]
  }>(
    (acc, satelliteRecord) => {
      const nomalizedSatellite = normallizeSatellite(satelliteRecord)

      if (!nomalizedSatellite) return acc

      acc.satelliteMapper[nomalizedSatellite.address] = nomalizedSatellite
      acc.allSatellitesIds.push(nomalizedSatellite.address)

      if (nomalizedSatellite.currentlyRegistered && nomalizedSatellite.status === 0) {
        acc.activeSatellitesIds.push(nomalizedSatellite.address)
      }

      if (Object.keys(nomalizedSatellite.participatedFeeds).length) {
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
}
