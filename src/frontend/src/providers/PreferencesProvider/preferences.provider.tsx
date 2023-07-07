import React, { useContext, useMemo, useState } from 'react'
import { PreferencesContext, PreferencesState, RPCNodeType } from './preferences.provider.types'
import { preferencesDefaultState } from './helpers/preferences.const'
import { ThemeType } from 'app/App.components/DarkThemeProvider/DarkThemeProvider.actions'
import { getChainInfo } from 'utils/blockchainApi'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { unknownToError } from 'errors/error'

type Props = {
  children: React.ReactNode
}

export const preferencesContext = React.createContext<PreferencesContext>(undefined!)

export const PreferencesProvider = ({ children }: Props) => {
  const { bug, success } = useToasterContext()
  const [preferences, setPreferences] = useState<PreferencesState>(preferencesDefaultState)

  const toggleTheme = (theme: ThemeType) => {
    setPreferences((prev) => ({ ...prev, themeSelected: theme }))
  }

  const getHeadData = async () => {
    try {
      const headData = await getChainInfo()
      if (JSON.stringify(preferences.headData) !== JSON.stringify(headData)) {
        setPreferences((prev) => ({ ...prev, headData }))
      }
    } catch (e) {
      const error = unknownToError(e)
      bug(error?.message)
    }
  }

  const toggleRPCNodePopup = (isOpened: boolean) => {
    setPreferences((prev) => ({ ...prev, changeNodePopupOpen: isOpened }))
  }

  const selectNewRPCNode = (newRPCNode: string, isRemove?: boolean) => {
    setPreferences((prev) => ({ ...prev, REACT_APP_RPC_PROVIDER: newRPCNode }))
    if (!isRemove) success('New RPC link selected', 'The new RPC link has been selected in the DAPP')
  }

  const setNewRPCNodes = (newRPCNodes: Array<RPCNodeType>, isRemove?: boolean) => {
    setPreferences((prev) => ({ ...prev, RPC_NODES: newRPCNodes }))

    if (!isRemove) success('New RPC link added', 'The new RPC link has been added in the DAPP')
  }

  const toggleSidebarCollapsing = (isOpened?: boolean) => {
    setPreferences((prev) => ({ ...prev, sidebarOpened: isOpened ?? !preferences.sidebarOpened }))
  }

  const contextProviderValue = useMemo(() => {
    return {
      toggleTheme,
      getHeadData,
      toggleRPCNodePopup,
      selectNewRPCNode,
      setNewRPCNodes,
      toggleSidebarCollapsing,
      ...preferences,
    }
  }, [preferences])

  return <preferencesContext.Provider value={contextProviderValue}>{children}</preferencesContext.Provider>
}

export const usePreferencesContext = () => {
  const context = useContext(preferencesContext)

  if (!context) {
    throw new Error('usePreferencesContext should be used within Preferences Provider!')
  }

  return context
}
