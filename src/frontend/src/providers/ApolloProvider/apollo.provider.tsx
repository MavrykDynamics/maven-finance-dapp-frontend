import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  ApolloClient,
  InMemoryCache,
  from,
  ApolloProvider as OriginalApolloProvider,
  ApolloError,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'

// types
import { ApolloContext } from './apollo.provider.types'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'providers/ToasterProvider/helpers/texts/toaster.texts'
import { httpLink, retryLink, splitLink, wsLink } from './apollo.config'
import { FatalError, isAbortError } from 'errors/error'

// hooks
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
        link: splitLink(wsLink, httpLink),
        cache: new InMemoryCache(),
      }),
    [errorLink],
  )

  const handleApolloError = useCallback((error: ApolloError, subName: string, bugMessage?: string) => {
    if (isAbortError(error.networkError)) return

    console.error(`${subName} query error: `, error)
    bug(
      TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'],
      bugMessage ?? TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'],
    )
  }, [])

  const context = useMemo(
    () => ({
      apolloClient,
      handleApolloError,
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
