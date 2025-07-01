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
import { convertNumberForClient, formatAsPercent } from '../../../utils/calcFunctions'

// const
import { MVN_DECIMALS } from 'utils/constants'
import { INACTIVE_SATELLITE_STATUS, satelliteStatusSchema, satelliteVoteSchema } from '../satellites.const'

type SatelliteVoteItemType = {
  id: number
  timestamp: number
  vote: SatelliteVoteType
  voteName: string
}

export const normalizeSatellite = (satelliteRecord: SatellitesIndexerDataType['satellite'][number]) => {
  try {
    const satelliteAddress = satelliteRecord.user_address
    const lastVotedProposal =
      satelliteRecord.last_proposal_cycle && satelliteRecord.last_proposal_governance_cycle_id
        ? {
            proposalId: satelliteRecord.last_proposal_id,
            proposalTitle: satelliteRecord.last_proposal_title,
            vote: satelliteVoteSchema.parse(satelliteRecord.last_vote),
          }
        : null

    const totalVotingPower = satelliteRecord.total_voting_power
    const participatedFeeds = {
      lastPredictedPrice: satelliteRecord.last_observation_data ?? null,
      predictionTime: satelliteRecord.last_observation_timestamp ?? null,
      predictionEpoch: satelliteRecord.last_observation_epoch ?? null,
      sMVNReward: satelliteRecord.smvn_rewards_total,
      XTZReward: satelliteRecord.mvrk_rewards_total,
    }

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
      delegationRatio: 0, // HERE
      delegatorCount: satelliteRecord.delegator_count ?? 0,
      totalVotingPower,
      satelliteFee: (satelliteRecord?.fee ?? 0) / 100,
      totalDelegatedAmount: convertNumberForClient({
        number: satelliteRecord.total_delegated_amount,
        grade: MVN_DECIMALS,
      }),

      mvnBalance: convertNumberForClient({
        number: satelliteRecord.mvn_balance,
        grade: MVN_DECIMALS,
      }),
      sMvnBalance: convertNumberForClient({
        number: satelliteRecord.smvn_balance,
        grade: MVN_DECIMALS,
      }),
      participatedFeeds,
      oracleEfficiency: formatAsPercent(satelliteRecord.participated_feeds),

      // votes & voting metrics
      lastVotedProposal,
      proposalsVotesAmount: satelliteRecord.gov_proposals_votes_count ?? 0,
      financialRequestsVotesAmount: satelliteRecord.fin_requests_votes_count ?? 0,
      satelliteActionVotesAmount: satelliteRecord.satellite_gov_actions_votes_count ?? 0,
      satelliteActionVotingPeriods: satelliteRecord.satellite_action_counter ?? 0,
      governanceProposalsVotingPeriods: satelliteRecord.governance_proposal_counter ?? 0,
      financialRequestsVotingPeriods: satelliteRecord.financial_request_counter ?? 0,
      createdGovProposalsAmount: satelliteRecord.created_gov_proposals_count ?? 0,
      createdFinProposalsAmount: satelliteRecord.created_fin_requests_count ?? 0,
      createdSatelliteGovProposalsAmount: satelliteRecord.created_satellite_gov_actions_count ?? 0,
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

      if (!normalizedSatellite || !normalizedSatellite.address) return acc

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
