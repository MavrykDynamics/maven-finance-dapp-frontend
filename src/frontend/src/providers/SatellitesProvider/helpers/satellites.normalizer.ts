import dayjs from 'dayjs'

// types
import {
  SatelliteIndexerStatusType,
  SatelliteRecordType,
  SatellitesIndexerDataType,
  SatelliteVoteType,
} from 'providers/SatellitesProvider/satellites.provider.types'
import { SatelliteVotesQueryQuery } from 'utils/__generated__/graphql'

// helpers
import { calcPercent, convertNumberForClient } from '../../../utils/calcFunctions'

// const
import { MVN_DECIMALS, MVRK_DECIMALS } from 'utils/constants'
import { INACTIVE_SATELLITE_STATUS, satelliteStatusSchema, satelliteVoteSchema } from '../satellites.const'

type SatelliteVoteItemType = {
  id: number
  timestamp: number
  vote: SatelliteVoteType
  voteName: string
}

/**
 *
 * @param satelliteOracleData – satellite predictions on feeds and rewards for this predictions
 * @returns@participatedFeeds – object where satellite participated and his latest prediction price, and his smvn & xtz rewards from this feed
 */
const getSatelliteOracleRewards = (
  satelliteOracleData: SatellitesIndexerDataType['satellite'][number]['user']['aggregator_oracles'],
) => {
  return satelliteOracleData.reduce<
    Record<
      string,
      {
        lastPredictedPrice: number | null
        sMVNReward: number | null
        XTZReward: number | null
        predictionTime: string | null
        predictionEpoch: number | null
      }
    >
  >(
    (
      acc,
      { smvnRewardsAmount, xtzRewardsAmount, aggregator: { address: feedAddress }, observations: [latestObservation] },
    ) => {
      acc[feedAddress] = {
        lastPredictedPrice: latestObservation?.data ?? null,
        predictionTime: latestObservation?.timestamp ?? null,
        predictionEpoch: latestObservation?.epoch ?? null,
        sMVNReward: convertNumberForClient({
          number: smvnRewardsAmount.aggregate?.sum?.reward ?? 0,
          grade: MVN_DECIMALS,
        }),
        XTZReward: convertNumberForClient({
          number: xtzRewardsAmount.aggregate?.sum?.reward ?? 0,
          grade: MVRK_DECIMALS,
        }),
      }
      return acc
    },
    {},
  )
}

/**
 *
 * @param satelliteUser – satellite we need to get efficiency for
 * @returns oracle efficiency – how often satellite predict feed price
 * TODO: @Sam-M-Israel should be reviewed by you
 */
const getSatelliteOracleEfficiency = (satelliteUser: SatellitesIndexerDataType['satellite'][number]['user']) => {
  const { aggregator_oracles, feedsObservationsAmount } = satelliteUser

  const latestObservation = aggregator_oracles.reduce(
    (acc, { init_epoch, init_round, observations: [lastFeedObservation] }) => {
      const { timestamp, epoch, round } = lastFeedObservation ?? {}

      if (dayjs(timestamp).valueOf() > acc.latestTimestamp) {
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

  return calcPercent(predictionSuccessRatio, totalFeedsObservation)
}

export const normalizeSatellite = (satelliteRecord: SatellitesIndexerDataType['satellite'][number]) => {
  try {
    const satelliteAddress = satelliteRecord.user.address
    const satelliteUser = satelliteRecord.user
    const lastVotedProposal = satelliteUser.lastVotedProposal[0]

    const totalVotingPower = convertNumberForClient({
      number: satelliteUser.governance_satellite_snapshots?.[0]?.total_voting_power ?? 0,
      grade: MVN_DECIMALS,
    })

    const participatedFeeds = getSatelliteOracleRewards(satelliteUser['aggregator_oracles'])

    const satelliteStatus: SatelliteIndexerStatusType = satelliteRecord.currently_registered
      ? satelliteStatusSchema.parse(
          satelliteRecord.currently_registered ? satelliteRecord.status : INACTIVE_SATELLITE_STATUS,
        )
      : INACTIVE_SATELLITE_STATUS

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
      delegationRatio: satelliteRecord?.delegation?.delegation_ratio / 100 || 0,
      delegatorCount: satelliteRecord.delegatorCount.aggregate?.count ?? 0,
      totalVotingPower,
      satelliteFee: (satelliteRecord?.fee ?? 0) / 100,
      totalDelegatedAmount: convertNumberForClient({
        number: satelliteRecord.total_delegated_amount,
        grade: MVN_DECIMALS,
      }),

      mvnBalance: convertNumberForClient({
        number: satelliteRecord?.user.mvn_balance,
        grade: MVN_DECIMALS,
      }),
      sMvnBalance: convertNumberForClient({
        number: satelliteRecord?.user.smvn_balance,
        grade: MVN_DECIMALS,
      }),
      participatedFeeds,
      oracleEfficiency: getSatelliteOracleEfficiency(satelliteUser),

      // votes & voting metrics
      lastVotedProposal:
        lastVotedProposal &&
        lastVotedProposal.governance_proposal.cycle === lastVotedProposal.governance_proposal.governance.cycle_id
          ? {
              vote: satelliteVoteSchema.parse(lastVotedProposal.vote),
              proposalTitle: lastVotedProposal.governance_proposal.title,
              proposalId: lastVotedProposal.governance_proposal.id,
            }
          : null,
      proposalsVotesAmount: satelliteUser.govProposalsVotesAmount.aggregate?.count ?? 0,
      financialRequestsVotesAmount: satelliteUser.finRequestsVotesAmount.aggregate?.count ?? 0,
      satelliteActionVotesAmount: satelliteUser.satelliteGovActionsVotesAmount.aggregate?.count ?? 0,
      satelliteActionVotingPeriods: satelliteRecord.satellite_action_counter ?? 0,
      governanceProposalsVotingPeriods: satelliteRecord.governance_proposal_counter ?? 0,
      financialRequestsVotingPeriods: satelliteRecord.financial_request_counter ?? 0,
      createdGovProposalsAmount: satelliteUser.createdGovProposalsAmount.aggregate?.count ?? 0,
      createdFinProposalsAmount: satelliteUser.createdFinRequestsAmount.aggregate?.count ?? 0,
      createdSatelliteGovProposalsAmount: satelliteUser.createdSatelliteGovActionsAmount.aggregate?.count ?? 0,
    }
  } catch (e) {
    console.error('normalizeSatellite parsing error: ', { e })
    return null
  }
}

export const normalizeSatellitesLedger = (store: SatellitesIndexerDataType) => {
  return store.satellite.reduce<{
    satelliteMapper: Record<string, SatelliteRecordType>
    satelliteIds: string[]
  }>(
    (acc, satelliteRecord) => {
      const normalizedSatellite = normalizeSatellite(satelliteRecord)

      if (!normalizedSatellite) return acc

      acc.satelliteMapper[normalizedSatellite.address] = normalizedSatellite
      acc.satelliteIds.push(normalizedSatellite.address)

      return acc
    },
    {
      satelliteMapper: {},
      satelliteIds: [],
    },
  )
}

export const normalizeSatelliteVotes = ({
  governance_proposals_votes,
  governance_financial_requests_votes,
  governance_satellite_actions_votes,
}: SatelliteVotesQueryQuery['satellite'][0]['user']) => {
  const proposalsVotes = governance_proposals_votes.reduce<Array<SatelliteVoteItemType>>((acc, vote) => {
    try {
      const voteValue = satelliteVoteSchema.parse(vote.vote)
      acc.push({
        id: vote.id,
        timestamp: dayjs(vote.timestamp).valueOf(),
        vote: voteValue,
        voteName: vote.governance_proposal.title,
      })
    } catch (e) {
      console.error('governance_proposals_votes vote parse error: ', { e })
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
          timestamp: dayjs(vote.timestamp).valueOf(),
          vote: voteValue,
          voteName: vote.governance_financial_request.request_type,
        })
      } catch (e) {
        console.error('governance_financial_requests_votes vote parse error: ', { e })
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
        timestamp: dayjs(vote.timestamp).valueOf(),
        vote: voteValue,
        voteName: vote.governance_satellite_action.governance_type,
      })
    } catch (e) {
      console.error('governance_satellite_actions_votes vote parse error: ', { e })
    } finally {
      return acc
    }
  }, [])

  return {
    satelliteActionVotes,
    financialRequestsVotes,
    proposalsVotes,
  }
}
