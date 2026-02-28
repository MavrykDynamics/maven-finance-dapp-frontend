import { useCallback } from 'react'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { DappConfigContextMethods, DappConfigContextStateType, RPCNodeType } from '../dappConfig.provider.types'
import { ThemeType } from 'consts/theme.const'

// utils
import { unknownToError } from 'errors/error'
import { setItemInStorage } from 'utils/storage'

// consts
import { RPC_NODE } from '../helpers/dappConfig.const'

type Props = {
  setDappConfigCtxState: React.Dispatch<React.SetStateAction<DappConfigContextStateType>>
}

export const useDappConfigMethods = ({ setDappConfigCtxState }: Props): DappConfigContextMethods => {
  const { bug, success } = useToasterContext()

  const handleCopyText = useCallback((textToCopy: string) => {
    try {
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
        success('Copied to Clipboard', `${textToCopy}`)
      }
    } catch (e) {
      console.error('copy to clipboard error: ', e)
    }
  }, [success])

  // preferences actions
  const toggleTheme = useCallback((theme: ThemeType) => {
    try {
      setItemInStorage('theme', theme)
      setDappConfigCtxState((prev) => ({ ...prev, preferences: { ...prev.preferences, themeSelected: theme } }))
    } catch (e) {
      const err = unknownToError(e)
      bug(err)
    }
  }, [bug])

  const toggleRPCNodePopup = useCallback((isOpened: boolean) => {
    setDappConfigCtxState((prev) => ({ ...prev, preferences: { ...prev.preferences, changeNodePopupOpen: isOpened } }))
  }, [])

  const selectNewRPCNode = useCallback((newRPCNode: string) => {
    setItemInStorage(RPC_NODE, newRPCNode)
    setDappConfigCtxState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, REACT_APP_RPC_PROVIDER: newRPCNode },
    }))
  }, [])

  const setNewRPCNodes = useCallback((newRPCNodes: Array<RPCNodeType>) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, RPC_NODES: newRPCNodes },
    }))
  }, [])

  const toggleSidebarCollapsing = useCallback((isOpened?: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, sidebarOpened: isOpened ?? !prev.preferences.sidebarOpened },
    }))
  }, [])

  // loading actions
  const toggleActionFullScreenLoader = useCallback((value: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      globalLoadingState: { ...prev.globalLoadingState, isActiveFullScreenLoader: value },
    }))
  }, [])

  const toggleActionCompletion = useCallback((value: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      globalLoadingState: { ...prev.globalLoadingState, isActionActive: value },
    }))
  }, [])

  const toggleWertLoader = useCallback((value: boolean) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      globalLoadingState: { ...prev.globalLoadingState, isWertLoading: value },
    }))
  }, [])

  const setDappTotalValueLocked = useCallback((newTvlValie: number) => {
    setDappConfigCtxState((prev) => ({
      ...prev,
      dappTotalValueLocked: newTvlValie,
    }))
  }, [])

  return {
    setDappTotalValueLocked,
    handleCopyText,
    toggleTheme,
    toggleRPCNodePopup,
    selectNewRPCNode,
    setNewRPCNodes,
    toggleSidebarCollapsing,
    toggleActionFullScreenLoader,
    toggleActionCompletion,
    toggleWertLoader,
  }
}
