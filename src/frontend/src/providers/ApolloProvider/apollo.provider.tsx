import React, { createContext, useContext, useMemo, useState } from 'react'
import { ApolloClient, InMemoryCache, from, ApolloProvider as OriginalApolloProvider } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

// consts
import { httpLink, retryLink, splitLink, wsLink } from './apollo.config'
import { FatalError, isAbortError } from 'errors/error'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { ApolloContext } from './apollo.provider.types'

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
        if (isAbortError(networkError)) return

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
            if (hasNetworkError) fatal(new FatalError('Server is disabled.'))

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
    [errorLink],
  )

  const context = useMemo(
    () => ({
      apolloClient,
    }),
    [apolloClient],
  )

  return (
    <apolloContext.Provider value={context}>
      <OriginalApolloProvider client={apolloClient}>{children}</OriginalApolloProvider>
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
