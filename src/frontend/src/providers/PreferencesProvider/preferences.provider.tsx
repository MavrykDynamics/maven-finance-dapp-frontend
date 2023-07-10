import React, { useContext, useMemo, useState } from 'react'
import { PreferencesContext, PreferencesState, RPCNodeType } from './preferences.provider.types'
import { RPC_NODE, preferencesDefaultState } from './helpers/preferences.const'
import { ThemeType } from 'app/App.components/DarkThemeProvider/DarkThemeProvider.const'
import { getChainInfo } from 'utils/blockchainApi'
import { setItemInStorage } from 'utils/storage'

type Props = {
  children: React.ReactNode
}

export const preferencesContext = React.createContext<PreferencesContext>(undefined!)

export const PreferencesProvider = ({ children }: Props) => {
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
      throw e
    }
  }

  const toggleRPCNodePopup = (isOpened: boolean) => {
    setPreferences((prev) => ({ ...prev, changeNodePopupOpen: isOpened }))
  }

  const selectNewRPCNode = (newRPCNode: string) => {
    setItemInStorage(RPC_NODE, newRPCNode)
    setPreferences((prev) => ({ ...prev, REACT_APP_RPC_PROVIDER: newRPCNode }))
  }

  const setNewRPCNodes = (newRPCNodes: Array<RPCNodeType>) => {
    setPreferences((prev) => ({ ...prev, RPC_NODES: newRPCNodes }))
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
