import { ApolloClient, InMemoryCache, split } from '@apollo/client'
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
    url: process.env.REACT_APP_BACKUP_GRAPHQL_WSS_API ?? '',
  }),
)

const backupwsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_GRAPHQL_WSS_API ?? '',
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

const errorLink = onError(({ operation, networkError }) => {
  // @ts-ignore
  if (networkError && networkError?.statusCode === 500) {
    console.log('Switching to backup server for HTTP and WSS requests...')
    const context = operation.getContext()
    operation.setContext(() => {
      return {
        ...context,
        link: splitLink(backupwsLink, backuphttpLink),
      }
    })
  }
})

export const client = new ApolloClient({
  link: errorLink.concat(retryLink.concat(splitLink(wsLink, httpLink))),
  cache: new InMemoryCache(),
})
