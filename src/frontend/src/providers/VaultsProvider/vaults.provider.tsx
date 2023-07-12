import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { VaultsContext, VaultsCtxState } from './vaults.provider.types'

// helpers

export const vaultsContext = React.createContext<VaultsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const VaultsProvider = ({ children }: Props) => {
  const [vaultsCtxState, setVaultsCtxState] = useState<VaultsCtxState>({
    vaultsMapper: {},
  })

  const providerValue = useMemo(() => {
    return {
      ...vaultsCtxState,
    }
  }, [vaultsCtxState])
  return <vaultsContext.Provider value={providerValue}>{children}</vaultsContext.Provider>
}

export const useVaultsContext = () => {
  const context = useContext(vaultsContext)

  if (!context) {
    throw new Error('vaultsContext should be used within VaultsProvider')
  }

  return context
}

export default VaultsProvider
