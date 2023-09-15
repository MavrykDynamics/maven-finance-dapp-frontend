import dayjs from 'dayjs'

// types
import {
  SatelliteVoteItemType,
  SatelliteRecordType,
  SatelliteIndexerStatusType,
} from 'providers/SatellitesProvider/satellites.provider.types'
import { SatelliteDataQueryQuery, SatelliteVotesQueryQuery } from 'utils/__generated__/graphql'

// helpers
import { calcPersent, convertNumberForClient } from '../../../utils/calcFunctions'

// const
import { MVK_DECIMALS, XTZ_DECIMALS } from 'utils/constants'
import { satelliteVoteSchema, satelliteStatusSchema, INACTIVE_SATELLITE_STATUS } from '../satellites.const'

/**
 *
 * @param satelliteOracleData – satellite predictions on feeds and rewards for this predictions
 * @returns @sMVKRewards – sMVK rewards from feeds, @XTZRewards – XTZ rewards from feeds, @participatedFeeds – object where satellite participated and his latest prediction price
 */
const getSatelliteOracleRewards = (
  satelliteOracleData: SatelliteDataQueryQuery['satellite'][number]['user']['aggregator_oracles'],
) => {
  return satelliteOracleData.reduce<{
    sMVKRewards: number
    XTZRewards: number
    participatedFeeds: Record<
      string,
      {
        lastPredictedPrice: number | null
      }
    >
  }>(
    (
      acc,
      { smvkRewardsAmount, xtzRewardsAmount, aggregator: { address: feedAddress }, observations: [latestObservation] },
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
        lastPredictedPrice: latestObservation?.data ?? null,
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

/**
 *
 * @param satelliteUser – satellite we need to get efficiency for
 * @returns oracle efficiency – how often satellite predict feed price
 * TODO: @Sam-M-Israel should be reviewed by you
 */
const getSatelliteOracleEfficiency = (satelliteUser: SatelliteDataQueryQuery['satellite'][number]['user']) => {
  const { aggregator_oracles, feedsObservationsAmount } = satelliteUser

  const latestObservation = aggregator_oracles.reduce(
    (acc, { init_epoch, init_round, observations: [lastFeedObservation] }) => {
      const { timestamp, epoch, round } = lastFeedObservation ?? {}

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

export const normallizeSatellite = (satelliteRecord: SatelliteDataQueryQuery['satellite'][0]) => {
  try {
    const satelliteAddress = satelliteRecord.user.address
    const satelliteUser = satelliteRecord.user
    const lastVotedProposal = satelliteUser.lastVotedProposal[0]

    const totalVotingPower = convertNumberForClient({
      number: satelliteUser.governance_satellite_snapshots?.[0]?.total_voting_power ?? 0,
      grade: MVK_DECIMALS,
    })

    const { sMVKRewards, XTZRewards, participatedFeeds } = getSatelliteOracleRewards(
      satelliteUser['aggregator_oracles'],
    )

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
      delegationRatio: satelliteRecord?.delegation?.delegation_ratio / 100 ?? 0,
      delegatorCount: satelliteRecord.delegatorCount.aggregate?.count ?? 0,
      totalVotingPower,
      satelliteFee: (satelliteRecord?.fee ?? 0) / 100,
      totalDelegatedAmount: convertNumberForClient({
        number: satelliteRecord.total_delegated_amount,
        grade: MVK_DECIMALS,
      }),

      mvkBalance: convertNumberForClient({ number: satelliteRecord?.user.mvk_balance, grade: MVK_DECIMALS }),
      sMvkBalance: convertNumberForClient({ number: satelliteRecord?.user.smvk_balance, grade: MVK_DECIMALS }),
      sMVKRewards,
      XTZRewards,
      participatedFeeds,
      oracleEfficiency: getSatelliteOracleEfficiency(satelliteUser),

      // votes & voting metrix
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
    console.error('normallizeSatellite parsing error: ', { e })
    return null
  }
}

export const normalizeSatellitesLedger = (store: SatelliteDataQueryQuery) => {
  return store.satellite.reduce<{
    satelliteMapper: Record<string, SatelliteRecordType>
    activeSatellitesIds: string[]
    oraclesIds: string[]
  }>(
    (acc, satelliteRecord) => {
      const nomalizedSatellite = normallizeSatellite(satelliteRecord)

      if (!nomalizedSatellite) return acc

      acc.satelliteMapper[nomalizedSatellite.address] = nomalizedSatellite

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
      oraclesIds: [],
    },
  )
}

export const normalizeSatelliteVotings = ({
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
