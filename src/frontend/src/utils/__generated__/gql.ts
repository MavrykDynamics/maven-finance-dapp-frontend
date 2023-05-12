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
    "\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n": types.SubscribeSmvkHistoryDataDocument,
    "\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n": types.SubscribeAdressBalanceDocument,
    "\n  subscription subscribeDoormanAddressBalance($doormanContractAddress: String) {\n    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {\n      mvk_balance\n    }\n  }\n": types.SubscribeDoormanAddressBalanceDocument,
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
export function gql(source: "\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n"): (typeof documents)["\n  subscription subscribeSmvkHistoryData {\n    smvk_history_data(distinct_on: timestamp) {\n      mvk_total_supply\n      smvk_total_supply\n      timestamp\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n"): (typeof documents)["\n  subscription subscribeAdressBalance($_eq: String) {\n    mavryk_user(where: { address: { _eq: $_eq } }) {\n      address\n      mvk_balance\n      smvk_balance\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription subscribeDoormanAddressBalance($doormanContractAddress: String) {\n    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {\n      mvk_balance\n    }\n  }\n"): (typeof documents)["\n  subscription subscribeDoormanAddressBalance($doormanContractAddress: String) {\n    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {\n      mvk_balance\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nsubscription subscribeMvkTokenTotal {\n  mvk_token {\n    total_supply\n    maximum_supply\n  }\n}\n"): (typeof documents)["\nsubscription subscribeMvkTokenTotal {\n  mvk_token {\n    total_supply\n    maximum_supply\n  }\n}\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;