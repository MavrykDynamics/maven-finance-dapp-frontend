import React, { createContext, useContext, useMemo, useState } from 'react'
import { ApolloClient, InMemoryCache, from, ApolloProvider as OriginalApolloProvider } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { ApolloContext } from './apollo.provider.types'
import { backuphttpLink, backupwsLink, httpLink, retryLink, splitLink, wsLink } from './apollo.config'
import { FatalError } from 'errors/error'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// context
const apolloContext = createContext<ApolloContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const ApolloProvider = ({ children }: Props) => {
  const { bug, fatal } = useToasterContext()
  const [hasNetworkError, setHasNetworkError] = useState(false)

  const errorLink = useMemo(
    () =>
      onError(({ networkError, graphQLErrors }) => {
        if (graphQLErrors) {
          for (const { message, locations, path } of graphQLErrors) {
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
          }
        }

        if (networkError) {
          console.log(`[Network error]: ${networkError}`)

          if (typeof window !== 'undefined' && !window.navigator.onLine) {
            bug('Sorry, your browser is offline.')
          } else {
            console.log('Some other network error occurred.')
            if (hasNetworkError) fatal(new FatalError('Both servers are disabled.'))

            setHasNetworkError(true)
          }
        }
      }),
    [hasNetworkError],
  )

  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        link: from([errorLink, retryLink, splitLink(wsLink, httpLink)]),
        cache: new InMemoryCache(),
      }),
    [],
  )

  const backupApolloClient = useMemo(
    () =>
      new ApolloClient({
        link: from([errorLink, retryLink, splitLink(backupwsLink, backuphttpLink)]),
        cache: new InMemoryCache(),
      }),
    [],
  )

  const internalApolloClient = useMemo(() => (hasNetworkError ? backupApolloClient : apolloClient), [hasNetworkError])

  const context = useMemo(
    () => ({
      apolloClient: internalApolloClient,
    }),
    [internalApolloClient],
  )

  return (
    <apolloContext.Provider value={context}>
      <OriginalApolloProvider client={internalApolloClient}>{children}</OriginalApolloProvider>
    </apolloContext.Provider>
  )
}

export const useApolloContext = () => {
  const context = useContext(apolloContext)
  if (!context) {
    throw new Error('useApolloContext should be used within ApolloProvider')
  }

  return context
}
