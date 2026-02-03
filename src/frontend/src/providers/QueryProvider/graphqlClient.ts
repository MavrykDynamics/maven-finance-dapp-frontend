import { GraphQLClient } from 'graphql-request'

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_API

if (!GRAPHQL_ENDPOINT) {
  throw new Error('REACT_APP_GRAPHQL_API environment variable is not set')
}

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'content-type': 'application/json',
  },
})
