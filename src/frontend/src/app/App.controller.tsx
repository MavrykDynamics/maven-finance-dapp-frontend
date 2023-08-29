import { useCallback, useEffect, useState } from 'react'
import { AnyAction } from 'redux'
import { useDispatch } from 'react-redux'
import { useMedia } from 'react-use'
import { ThunkDispatch } from 'redux-thunk'
import { useCookies } from 'react-cookie'

import { configureStore } from './App.store'

// consts
import { RPC_NODE } from 'providers/DappConfigProvider/helpers/dappConfig.const'
import { ecadLabGhostnetRpcNode } from 'consts/rpcNodes.const'

// types
import { State } from '../reducers'

// view, styles
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { Menu } from './App.components/Menu/Menu.controller'
import { SettingPopup } from './App.components/SettingsPopup/SettingsPopup'
import { Loaders } from './App.components/Loader/Loader.view'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { AppStyled } from './App.style'
import { PolicyPopup } from 'app/App.components/PolicyPopup/Policy.controller'
import { Footer } from './App.components/Footer/Footer'

// actions
import { getContractAddressesStorage } from 'reducers/actions/contractAddresses.actions'
import { setItemInStorage } from 'utils/storage'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const { store } = configureStore({})
export type AppDispatch = ThunkDispatch<State, unknown, AnyAction>
export type GetState = typeof store.getState

export const App = () => {
  const dispatch = useDispatch()

  const showSidebarOpened = useMedia('(min-width: 1400px)')
  const [{ policyPopup }, setCookie] = useCookies(['policyPopup'])

  const {
    toggleSidebarCollapsing,
    toggleRPCNodePopup,
    preferences: { changeNodePopupOpen, sidebarOpened },
  } = useDappConfigContext()

  useEffect(() => {
    dispatch(getContractAddressesStorage())
  }, [])

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

      <Toaster />
      <Menu />

      <SettingPopup isModalOpened={changeNodePopupOpen} closeModal={closeModalHandler} />
      <PolicyPopup isModalOpened={!isIOS && !policyPopup} proccedPolicy={proccedPolicy} />

      <AppRoutes />

      <Footer />
    </AppStyled>
  )
}
