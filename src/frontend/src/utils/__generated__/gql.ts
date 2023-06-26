/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  subscription FeedsRewardsAmountSubscription {\n    aggregator_aggregate {\n      aggregate {\n        sum {\n          reward_amount_smvk\n        }\n      }\n    }\n  }\n": types.FeedsRewardsAmountSubscriptionDocument,
    "\n  subscription subsribeOracleDataFeed {\n    aggregator(where: { admin: { _neq: \"\" } }, order_by: { creation_timestamp: desc }) {\n      address\n      admin\n      decimals\n      factory {\n        address\n      }\n      history_data(distinct_on: timestamp, order_by: { timestamp: desc }) {\n        data\n        timestamp\n        aggregator {\n          decimals\n        }\n      }\n      metadata\n      network\n      creation_timestamp\n      last_completed_data\n      last_completed_data_last_updated_at\n      last_completed_data_pct_oracle_resp\n      last_updated_at\n      heart_beat_seconds\n      name\n      reward_amount_xtz\n      reward_amount_smvk\n      pct_oracle_threshold\n      alpha_pct_per_thousand\n      heart_beat_seconds\n      oracles {\n        observations {\n          epoch\n          round\n          timestamp\n          oracle {\n            user_id\n            init_epoch\n            init_round\n          }\n        }\n      }\n    }\n  }\n": types.SubsribeOracleDataFeedDocument,
    "\nquery getMaxlenghtsQuery {\n    council {\n      council_member_image_max_length\n      council_member_name_max_length\n      council_member_website_max_length\n      request_purpose_max_length\n      request_token_name_max_length\n    }\n    governance {\n      proposal_description_max_length\n      proposal_invoice_max_length\n      proposal_metadata_title_max_length\n      proposal_source_code_max_length\n      proposal_title_max_length\n    }\n    emergency_governance {\n      proposal_desc_max_length\n      proposal_title_max_length\n    }\n    governance_satellite {\n      gov_purpose_max_length\n    }\n    delegation {\n      satellite_description_max_length\n      satellite_name_max_length\n      satellite_website_max_length\n    }\n  }\n  \n": types.GetMaxlenghtsQueryDocument,
    "\n  subscription tokensMetadata {\n    token {\n      metadata\n      token_address\n      token_standard\n\n      # check whether tokens is collateral token\n      lending_controller_collateral_tokens {\n        token_name\n      }\n      # check whether tokens is mToken\n      m_tokens {\n        address\n      }\n\n      # check that it's real MVK token\n      mvk_tokens {\n        address\n      }\n    }\n  }\n": types.TokensMetadataDocument,
    "\nquery MVKFaucet {\n  mvk_faucet{\n    address\n  }\n}\n": types.MvkFaucetDocument,
    "\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n": types.SubscribeSmvkHistoryDataDocument,
    "\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n": types.SubscribeAdressBalanceDocument,
    "\nsubscription subscribeMvkTokenTotal {\n  mvk_token {\n    total_supply\n    maximum_supply\n  }\n}\n": types.SubscribeMvkTokenTotalDocument,
    "\nsubscription glasssBrokenStatus {\n  break_glass {\n    glass_broken\n  }\n}\n": types.GlasssBrokenStatusDocument,
    "\nsubscription whiteListDevelopers {\n  whitelist_developer {\n    developer {\n      address\n    }\n  }\n}\n": types.WhiteListDevelopersDocument,
    "\n  subscription breakGlassfarm($_eq: String) {\n    farm(where: {admin: {_neq: \"\"}}) {\n      name\n      address\n      claim_paused\n      deposit_paused\n      withdraw_paused\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassfarmDocument,
    "\n  subscription breakGlassfarmFactory($_eq: String) {\n    farm_factory(where: {admin: {_neq: \"\"}}) {\n      create_farm_paused\n      track_farm_paused\n      untrack_farm_paused\n      address\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassfarmFactoryDocument,
    "\n  subscription breakGlassDelegation($_eq: String) {\n    delegation(where: {admin: {_neq: \"\"}}) {\n      delegate_to_satellite_paused\n      distribute_reward_paused\n      register_as_satellite_paused\n      undelegate_from_satellite_paused\n      unregister_as_satellite_paused\n      update_satellite_record_paused\n      address\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassDelegationDocument,
    "\n  subscription breakGlassDoorman($_eq: String) {\n    doorman(where: {admin: {_neq: \"\"}}) {\n      address\n      compound_paused\n      farm_claim_paused\n      unstake_paused\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassDoormanDocument,
    "\n  subscription breakGlassTreasury($_eq: String) {\n    treasury(where: {admin: {_neq: \"\"}}) {\n      name\n      mint_mvk_and_transfer_paused\n      stake_mvk_paused\n      transfer_paused\n      address\n      unstake_mvk_paused\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassTreasuryDocument,
    "\n  subscription breakGlassTreasuryFactory($_eq: String) {\n    treasury_factory(where: {admin: {_neq: \"\"}}) {\n      create_treasury_paused\n      address\n      track_treasury_paused\n      untrack_treasury_paused\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassTreasuryFactoryDocument,
    "\n  subscription breakGlassAggregator($_eq: String) {\n    aggregator(where: {admin: {_neq: \"\"}}) {\n      address\n      name\n      withdraw_reward_smvk_paused\n      withdraw_reward_xtz_paused\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassAggregatorDocument,
    "\n  subscription breakGlassAggregatorFactory($_eq: String) {\n    aggregator_factory(where: {admin: {_neq: \"\"}}) {\n      address\n      untrack_aggregator_paused\n      track_aggregator_paused\n      distribute_reward_xtz_paused\n      distribute_reward_smvk_paused\n      create_aggregator_paused\n      admin\n      last_updated_at\n    }\n  }\n": types.BreakGlassAggregatorFactoryDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription FeedsRewardsAmountSubscription {\n    aggregator_aggregate {\n      aggregate {\n        sum {\n          reward_amount_smvk\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription FeedsRewardsAmountSubscription {\n    aggregator_aggregate {\n      aggregate {\n        sum {\n          reward_amount_smvk\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription subsribeOracleDataFeed {\n    aggregator(where: { admin: { _neq: \"\" } }, order_by: { creation_timestamp: desc }) {\n      address\n      admin\n      decimals\n      factory {\n        address\n      }\n      history_data(distinct_on: timestamp, order_by: { timestamp: desc }) {\n        data\n        timestamp\n        aggregator {\n          decimals\n        }\n      }\n      metadata\n      network\n      creation_timestamp\n      last_completed_data\n      last_completed_data_last_updated_at\n      last_completed_data_pct_oracle_resp\n      last_updated_at\n      heart_beat_seconds\n      name\n      reward_amount_xtz\n      reward_amount_smvk\n      pct_oracle_threshold\n      alpha_pct_per_thousand\n      heart_beat_seconds\n      oracles {\n        observations {\n          epoch\n          round\n          timestamp\n          oracle {\n            user_id\n            init_epoch\n            init_round\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription subsribeOracleDataFeed {\n    aggregator(where: { admin: { _neq: \"\" } }, order_by: { creation_timestamp: desc }) {\n      address\n      admin\n      decimals\n      factory {\n        address\n      }\n      history_data(distinct_on: timestamp, order_by: { timestamp: desc }) {\n        data\n        timestamp\n        aggregator {\n          decimals\n        }\n      }\n      metadata\n      network\n      creation_timestamp\n      last_completed_data\n      last_completed_data_last_updated_at\n      last_completed_data_pct_oracle_resp\n      last_updated_at\n      heart_beat_seconds\n      name\n      reward_amount_xtz\n      reward_amount_smvk\n      pct_oracle_threshold\n      alpha_pct_per_thousand\n      heart_beat_seconds\n      oracles {\n        observations {\n          epoch\n          round\n          timestamp\n          oracle {\n            user_id\n            init_epoch\n            init_round\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery getMaxlenghtsQuery {\n    council {\n      council_member_image_max_length\n      council_member_name_max_length\n      council_member_website_max_length\n      request_purpose_max_length\n      request_token_name_max_length\n    }\n    governance {\n      proposal_description_max_length\n      proposal_invoice_max_length\n      proposal_metadata_title_max_length\n      proposal_source_code_max_length\n      proposal_title_max_length\n    }\n    emergency_governance {\n      proposal_desc_max_length\n      proposal_title_max_length\n    }\n    governance_satellite {\n      gov_purpose_max_length\n    }\n    delegation {\n      satellite_description_max_length\n      satellite_name_max_length\n      satellite_website_max_length\n    }\n  }\n  \n"): (typeof documents)["\nquery getMaxlenghtsQuery {\n    council {\n      council_member_image_max_length\n      council_member_name_max_length\n      council_member_website_max_length\n      request_purpose_max_length\n      request_token_name_max_length\n    }\n    governance {\n      proposal_description_max_length\n      proposal_invoice_max_length\n      proposal_metadata_title_max_length\n      proposal_source_code_max_length\n      proposal_title_max_length\n    }\n    emergency_governance {\n      proposal_desc_max_length\n      proposal_title_max_length\n    }\n    governance_satellite {\n      gov_purpose_max_length\n    }\n    delegation {\n      satellite_description_max_length\n      satellite_name_max_length\n      satellite_website_max_length\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription tokensMetadata {\n    token {\n      metadata\n      token_address\n      token_standard\n\n      # check whether tokens is collateral token\n      lending_controller_collateral_tokens {\n        token_name\n      }\n      # check whether tokens is mToken\n      m_tokens {\n        address\n      }\n\n      # check that it's real MVK token\n      mvk_tokens {\n        address\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription tokensMetadata {\n    token {\n      metadata\n      token_address\n      token_standard\n\n      # check whether tokens is collateral token\n      lending_controller_collateral_tokens {\n        token_name\n      }\n      # check whether tokens is mToken\n      m_tokens {\n        address\n      }\n\n      # check that it's real MVK token\n      mvk_tokens {\n        address\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery MVKFaucet {\n  mvk_faucet{\n    address\n  }\n}\n"): (typeof documents)["\nquery MVKFaucet {\n  mvk_faucet{\n    address\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n"): (typeof documents)["\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n"): (typeof documents)["\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nsubscription subscribeMvkTokenTotal {\n  mvk_token {\n    total_supply\n    maximum_supply\n  }\n}\n"): (typeof documents)["\nsubscription subscribeMvkTokenTotal {\n  mvk_token {\n    total_supply\n    maximum_supply\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nsubscription glasssBrokenStatus {\n  break_glass {\n    glass_broken\n  }\n}\n"): (typeof documents)["\nsubscription glasssBrokenStatus {\n  break_glass {\n    glass_broken\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nsubscription whiteListDevelopers {\n  whitelist_developer {\n    developer {\n      address\n    }\n  }\n}\n"): (typeof documents)["\nsubscription whiteListDevelopers {\n  whitelist_developer {\n    developer {\n      address\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassfarm($_eq: String) {\n    farm(where: {admin: {_neq: \"\"}}) {\n      name\n      address\n      claim_paused\n      deposit_paused\n      withdraw_paused\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassfarm($_eq: String) {\n    farm(where: {admin: {_neq: \"\"}}) {\n      name\n      address\n      claim_paused\n      deposit_paused\n      withdraw_paused\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassfarmFactory($_eq: String) {\n    farm_factory(where: {admin: {_neq: \"\"}}) {\n      create_farm_paused\n      track_farm_paused\n      untrack_farm_paused\n      address\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassfarmFactory($_eq: String) {\n    farm_factory(where: {admin: {_neq: \"\"}}) {\n      create_farm_paused\n      track_farm_paused\n      untrack_farm_paused\n      address\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassDelegation($_eq: String) {\n    delegation(where: {admin: {_neq: \"\"}}) {\n      delegate_to_satellite_paused\n      distribute_reward_paused\n      register_as_satellite_paused\n      undelegate_from_satellite_paused\n      unregister_as_satellite_paused\n      update_satellite_record_paused\n      address\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassDelegation($_eq: String) {\n    delegation(where: {admin: {_neq: \"\"}}) {\n      delegate_to_satellite_paused\n      distribute_reward_paused\n      register_as_satellite_paused\n      undelegate_from_satellite_paused\n      unregister_as_satellite_paused\n      update_satellite_record_paused\n      address\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassDoorman($_eq: String) {\n    doorman(where: {admin: {_neq: \"\"}}) {\n      address\n      compound_paused\n      farm_claim_paused\n      unstake_paused\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassDoorman($_eq: String) {\n    doorman(where: {admin: {_neq: \"\"}}) {\n      address\n      compound_paused\n      farm_claim_paused\n      unstake_paused\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassTreasury($_eq: String) {\n    treasury(where: {admin: {_neq: \"\"}}) {\n      name\n      mint_mvk_and_transfer_paused\n      stake_mvk_paused\n      transfer_paused\n      address\n      unstake_mvk_paused\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassTreasury($_eq: String) {\n    treasury(where: {admin: {_neq: \"\"}}) {\n      name\n      mint_mvk_and_transfer_paused\n      stake_mvk_paused\n      transfer_paused\n      address\n      unstake_mvk_paused\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassTreasuryFactory($_eq: String) {\n    treasury_factory(where: {admin: {_neq: \"\"}}) {\n      create_treasury_paused\n      address\n      track_treasury_paused\n      untrack_treasury_paused\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassTreasuryFactory($_eq: String) {\n    treasury_factory(where: {admin: {_neq: \"\"}}) {\n      create_treasury_paused\n      address\n      track_treasury_paused\n      untrack_treasury_paused\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassAggregator($_eq: String) {\n    aggregator(where: {admin: {_neq: \"\"}}) {\n      address\n      name\n      withdraw_reward_smvk_paused\n      withdraw_reward_xtz_paused\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassAggregator($_eq: String) {\n    aggregator(where: {admin: {_neq: \"\"}}) {\n      address\n      name\n      withdraw_reward_smvk_paused\n      withdraw_reward_xtz_paused\n      admin\n      last_updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription breakGlassAggregatorFactory($_eq: String) {\n    aggregator_factory(where: {admin: {_neq: \"\"}}) {\n      address\n      untrack_aggregator_paused\n      track_aggregator_paused\n      distribute_reward_xtz_paused\n      distribute_reward_smvk_paused\n      create_aggregator_paused\n      admin\n      last_updated_at\n    }\n  }\n"): (typeof documents)["\n  subscription breakGlassAggregatorFactory($_eq: String) {\n    aggregator_factory(where: {admin: {_neq: \"\"}}) {\n      address\n      untrack_aggregator_paused\n      track_aggregator_paused\n      distribute_reward_xtz_paused\n      distribute_reward_smvk_paused\n      create_aggregator_paused\n      admin\n      last_updated_at\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;