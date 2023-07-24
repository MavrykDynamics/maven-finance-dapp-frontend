import { ApolloClient, InMemoryCache, split, from } from '@apollo/client'
import { HttpLink } from '@apollo/client/link/http'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

// apollo client setup
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_API ?? '',
})

const backuphttpLink = new HttpLink({
  uri: process.env.REACT_APP_BACKUP_GRAPHQL_API ?? '',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WSS_API ?? '',
  }),
)

const backupwsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_BACKUP_GRAPHQL_WSS_API ?? '',
  }),
)

const splitLink = (wsLink: GraphQLWsLink, httpLink: HttpLink) =>
  split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink,
  )

const retryLink = new RetryLink({
  attempts: {
    max: 5,
    retryIf: (error) => !!error,
  },
})

const errorLink = onError(({ networkError }) => {
  // @ts-ignore
  if (networkError && (networkError?.statusCode >= 500 || networkError?.statusCode === 404)) {
    console.log('Network error')
    window.location.replace(window.location.origin.concat('/404'))
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink(wsLink, httpLink)]),
  cache: new InMemoryCache(),
})
