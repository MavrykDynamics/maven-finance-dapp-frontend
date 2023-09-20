import { useCallback, useEffect, useState } from 'react'
import { useMedia } from 'react-use'
import { useCookies } from 'react-cookie'

// view, styles
import { Menu } from './App.components/Menu/Menu.controller'
import { SettingPopup } from './App.components/SettingsPopup/SettingsPopup'
import { Loaders } from './App.components/Loader/Loader.view'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { AppStyled } from './App.style'
import { PolicyPopup } from 'app/App.components/PolicyPopup/Policy.controller'
import { Footer } from './App.components/Footer/Footer'

// consts
import { RPC_NODE } from 'providers/DappConfigProvider/helpers/dappConfig.const'
import { ecadLabGhostnetRpcNode } from 'consts/rpcNodes.const'

// utils
import { setItemInStorage } from 'utils/storage'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const App = () => {
  const showSidebarOpened = useMedia('(min-width: 1400px)')
  const [{ policyPopup }, setCookie] = useCookies(['policyPopup'])

  const {
    toggleSidebarCollapsing,
    toggleRPCNodePopup,
    preferences: { changeNodePopupOpen, sidebarOpened },
  } = useDappConfigContext()

  useEffect(() => {
    toggleSidebarCollapsing(showSidebarOpened)
  }, [showSidebarOpened])

  // IOS mobile handle
  const [isIOS, setIsIOS] = useState(true)

  useEffect(() => {
    setIsIOS(
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform),
    )
  }, [])

  // when user closes the tab - reset RPC node to the dafult one
  useEffect(() => {
    const handleBeforeUnload = () => {
      setItemInStorage(RPC_NODE, ecadLabGhostnetRpcNode)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const closeModalHandler = useCallback(() => toggleRPCNodePopup(false), [])
  const proccedPolicy = useCallback(() => setCookie('policyPopup', true), [])

  return (
    <AppStyled isExpandedMenu={sidebarOpened}>
      <Loaders />

      <Menu />

      <SettingPopup isModalOpened={changeNodePopupOpen} closeModal={closeModalHandler} />
      <PolicyPopup isModalOpened={!isIOS && !policyPopup} proccedPolicy={proccedPolicy} />

      <AppRoutes />

      <Footer />
    </AppStyled>
  )
}
