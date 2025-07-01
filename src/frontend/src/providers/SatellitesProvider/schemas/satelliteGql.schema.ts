import { z } from 'zod'

export const satelliteSchema = z.object({
  description: z.string(),
  fee: z.number(),
  image: z.string().url(),
  name: z.string(),
  status: z.number(),
  website: z.string().nullable(),
  currently_registered: z.boolean(),
  peer_id: z.string().nullable(),
  public_key: z.string().nullable(),
  satellite_action_counter: z.number(),
  governance_proposal_counter: z.number(),
  financial_request_counter: z.number(),
  delegator_count: z.number(),
  user_address: z.string(),
  smvn_balance: z.number(),
  mvn_balance: z.number(),
  total_observations_count: z.number(),
  smvn_rewards_total: z.number(),
  mvrk_rewards_total: z.number(),
  total_voting_power: z.number(),
  created_fin_requests_count: z.number(),
  gov_proposals_votes_count: z.number(),
  fin_requests_votes_count: z.number(),
  financial_requests_voted_on: z.number(),
  free_smvn_balance: z.number(),
  created_gov_proposals_count: z.number(),
  created_satellite_gov_actions_count: z.number(),

  // nullable fields
  last_vote: z.string().nullable(),
  last_proposal_current_round: z.string().nullable(),
  last_proposal_cycle: z.string().nullable(),
  last_proposal_governance_cycle_id: z.string().nullable(),

  // additional voting fields
  proposalId: z.any(),
  proposalTitle: z.string().nullable().optional(),
  vote: z
    .union([z.literal(0), z.literal(1), z.literal(2)])
    .nullable()
    .optional(),

  total_delegated_amount: z.number(),
  satellite_id: z.number(),
  satellite_gov_actions_votes_count: z.number(),
  satellite_actions_voted_on: z.number(),
  registration_timestamp: z.string(),
  proposals_voted_on: z.number(),
  participation_rate: z.number(),
  participated_feeds: z.number(),
  last_updated: z.string().nullable(),
  last_proposal_title: z.string().nullable(),
  last_proposal_id: z.string().nullable().nullable(),
  last_observation_timestamp: z.string().nullable(),
  last_observation_round: z.number().nullable(),
  last_observation_data: z.number().nullable(),
  last_observation_epoch: z.number().nullable(),
  last_observation_aggregator_address: z.string().nullable(),
})
