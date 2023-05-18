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
    "\nquery getMaxlenghtsQuery {\n    council {\n      council_member_image_max_length\n      council_member_name_max_length\n      council_member_website_max_length\n      request_purpose_max_length\n      request_token_name_max_length\n    }\n    governance(order_by: {active: desc}) {\n      proposal_description_max_length\n      proposal_invoice_max_length\n      proposal_metadata_title_max_length\n      proposal_source_code_max_length\n      proposal_title_max_length\n    }\n    emergency_governance {\n      proposal_desc_max_length\n      proposal_title_max_length\n    }\n    governance_satellite {\n      gov_purpose_max_length\n    }\n    delegation {\n      satellite_description_max_length\n      satellite_image_max_length\n      satellite_name_max_length\n      satellite_website_max_length\n    }\n  }\n  \n": types.GetMaxlenghtsQueryDocument,
    "\nquery GetContractAddress {\n  governance(where: {active: {_eq: true}}) {\n    general_contracts(where: {contract_name: {_eq: \"paymentTreasury\"}}) {\n      contract_address\n    }\n  }\n}\n": types.GetContractAddressDocument,
    "\nquery DappTokens($_whitelistTokensAddress: String) {\n  dipdup_contract_metadata {\n    contract\n    created_at\n    metadata\n    id\n    network\n    update_id\n    updated_at\n  }\n\n  dipdup_token_metadata {\n    contract\n    created_at\n    metadata\n    id\n    network\n    update_id\n    updated_at\n  }\n\n  treasury(where: {address: {_eq: $_whitelistTokensAddress}}) {\n    whitelist_token_contracts {\n      contract_address\n      contract_name\n      token_contract_standard\n    }\n  }\n\n  m_token {\n    accounts {\n      user_id\n      m_token_id\n    }\n    address\n    admin\n    loan_token_name\n  }\n}\n": types.DappTokensDocument,
    "\nquery MVKFaucet {\n  mvk_faucet{\n    address\n  }\n}\n": types.MvkFaucetDocument,
    "\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n": types.SubscribeSmvkHistoryDataDocument,
    "\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n": types.SubscribeAdressBalanceDocument,
    "\nsubscription subscribeMvkTokenTotal {\n  mvk_token {\n    total_supply\n    maximum_supply\n  }\n}\n": types.SubscribeMvkTokenTotalDocument,
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
export function gql(source: "\nquery getMaxlenghtsQuery {\n    council {\n      council_member_image_max_length\n      council_member_name_max_length\n      council_member_website_max_length\n      request_purpose_max_length\n      request_token_name_max_length\n    }\n    governance(order_by: {active: desc}) {\n      proposal_description_max_length\n      proposal_invoice_max_length\n      proposal_metadata_title_max_length\n      proposal_source_code_max_length\n      proposal_title_max_length\n    }\n    emergency_governance {\n      proposal_desc_max_length\n      proposal_title_max_length\n    }\n    governance_satellite {\n      gov_purpose_max_length\n    }\n    delegation {\n      satellite_description_max_length\n      satellite_image_max_length\n      satellite_name_max_length\n      satellite_website_max_length\n    }\n  }\n  \n"): (typeof documents)["\nquery getMaxlenghtsQuery {\n    council {\n      council_member_image_max_length\n      council_member_name_max_length\n      council_member_website_max_length\n      request_purpose_max_length\n      request_token_name_max_length\n    }\n    governance(order_by: {active: desc}) {\n      proposal_description_max_length\n      proposal_invoice_max_length\n      proposal_metadata_title_max_length\n      proposal_source_code_max_length\n      proposal_title_max_length\n    }\n    emergency_governance {\n      proposal_desc_max_length\n      proposal_title_max_length\n    }\n    governance_satellite {\n      gov_purpose_max_length\n    }\n    delegation {\n      satellite_description_max_length\n      satellite_image_max_length\n      satellite_name_max_length\n      satellite_website_max_length\n    }\n  }\n  \n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetContractAddress {\n  governance(where: {active: {_eq: true}}) {\n    general_contracts(where: {contract_name: {_eq: \"paymentTreasury\"}}) {\n      contract_address\n    }\n  }\n}\n"): (typeof documents)["\nquery GetContractAddress {\n  governance(where: {active: {_eq: true}}) {\n    general_contracts(where: {contract_name: {_eq: \"paymentTreasury\"}}) {\n      contract_address\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery DappTokens($_whitelistTokensAddress: String) {\n  dipdup_contract_metadata {\n    contract\n    created_at\n    metadata\n    id\n    network\n    update_id\n    updated_at\n  }\n\n  dipdup_token_metadata {\n    contract\n    created_at\n    metadata\n    id\n    network\n    update_id\n    updated_at\n  }\n\n  treasury(where: {address: {_eq: $_whitelistTokensAddress}}) {\n    whitelist_token_contracts {\n      contract_address\n      contract_name\n      token_contract_standard\n    }\n  }\n\n  m_token {\n    accounts {\n      user_id\n      m_token_id\n    }\n    address\n    admin\n    loan_token_name\n  }\n}\n"): (typeof documents)["\nquery DappTokens($_whitelistTokensAddress: String) {\n  dipdup_contract_metadata {\n    contract\n    created_at\n    metadata\n    id\n    network\n    update_id\n    updated_at\n  }\n\n  dipdup_token_metadata {\n    contract\n    created_at\n    metadata\n    id\n    network\n    update_id\n    updated_at\n  }\n\n  treasury(where: {address: {_eq: $_whitelistTokensAddress}}) {\n    whitelist_token_contracts {\n      contract_address\n      contract_name\n      token_contract_standard\n    }\n  }\n\n  m_token {\n    accounts {\n      user_id\n      m_token_id\n    }\n    address\n    admin\n    loan_token_name\n  }\n}\n"];
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

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;