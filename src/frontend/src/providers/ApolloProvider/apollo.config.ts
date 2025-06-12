import { split } from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { RetryLink } from '@apollo/client/link/retry'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { isAbortError } from 'errors/error'

// apollo client setup
export const httpLink = new BatchHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_API ?? '',
})

export const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WSS_API ?? '',
  }),
)

export const splitLink = (wsLink: GraphQLWsLink, httpLink: BatchHttpLink) =>
  split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink,
  )

export const retryLink = new RetryLink({
  attempts: {
    max: 3,
    retryIf: (error) => !isAbortError(error),
  },
})
