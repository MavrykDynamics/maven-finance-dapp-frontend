import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// consts
import { queryClient } from './queryClient'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'providers/ToasterProvider/helpers/texts/toaster.texts'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// helpers
import { FatalError, isAbortError } from 'errors/error'

type QueryProviderContext = {
  handleQueryError: (error: unknown, queryName: string, bugMessage?: string) => void
}

const queryProviderContext = createContext<QueryProviderContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const QueryProvider = ({ children }: Props) => {
  const { bug, fatal } = useToasterContext()
  const [hasNetworkError, setHasNetworkError] = useState(false)

  const handleQueryError = useCallback(
    (error: unknown, queryName: string, bugMessage?: string) => {
      if (isAbortError(error)) return

      // Check for network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
          bug('Sorry, your browser is offline.')
        } else {
          if (hasNetworkError) fatal(new FatalError('Server is disabled.'))
          setHasNetworkError(true)
        }
        return
      }

      bug(
        TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'],
        bugMessage ?? TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'],
      )
    },
    [bug, fatal, hasNetworkError],
  )

  const context = useMemo(
    () => ({
      handleQueryError,
    }),
    [handleQueryError],
  )

  return (
    <queryProviderContext.Provider value={context}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.REACT_APP_ENV === 'dev' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </queryProviderContext.Provider>
  )
}

export const useQueryProvider = () => {
  const context = useContext(queryProviderContext)

  if (!context) {
    throw new Error('useQueryProvider should be used within QueryProvider')
  }

  return context
}
