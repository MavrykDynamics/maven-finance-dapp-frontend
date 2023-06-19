import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AnyAction } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { useMedia } from 'react-use'
import { ThunkDispatch } from 'redux-thunk'
import { useCookies } from 'react-cookie'

import { configureStore } from './App.store'

// providers
import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

// hooks
import { useInitializer } from './App.hooks/useInitializer'

// types
import { State } from '../reducers'

// view, styles
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { Menu } from './App.components/Menu/Menu.controller'
import { ActionLoader, LoaderRocket, WertLoader } from './App.components/Loader/Loader.view'
import { SettingPopup } from './App.components/SettingsPopup/SettingsPopup'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { AppStyled } from './App.style'
import { PolicyPopup } from 'app/App.components/PolicyPopup/Policy.controller'
import { Footer } from './App.components/Footer/Footer'

// actions
import { toggleSidebarCollapsing } from './App.components/Menu/Menu.actions'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { getContractAddressesStorage } from 'reducers/actions/contractAddresses.actions'
import { connect } from './App.components/ConnectWallet/ConnectWallet.actions'
import { toggleInitialDataLoading } from './App.components/Loader/Loader.action'
import { toggleRPCNodePopup } from './App.components/SettingsPopup/SettingsPopup.actions'

export const { store } = configureStore({})
export type AppDispatch = ThunkDispatch<State, unknown, AnyAction>
export type GetState = typeof store.getState

const AppContainer = () => {
  const dispatch = useDispatch()

  const showSidebarOpened = useMedia('(min-width: 1400px)')
  const [{ policyPopup }, setCookie] = useCookies(['policyPopup'])

  const { changeNodePopupOpen, sidebarOpened } = useSelector((state: State) => state.preferences)
  const { isInitialDataLoading } = useSelector((state: State) => state.loading)

  const [isIOS, setIsIOS] = useState(true)

  // inital data load
  const { isLoading: isInitialCtxLoading } = useInitializer()

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  useEffect(() => {
    ;(async () => {
      // Needs to be fetched before promise all
      await dispatch(getContractAddressesStorage())
      // Fetching initial&common data for DAPP
      await dispatch(getSatellitesStorage())

      // For using Beacon wallet
      if (
        localStorage.getItem('beacon:active-account') &&
        localStorage.getItem('beacon:active-account') !== 'undefined'
      ) {
        await dispatch(connect())
      }

      // Turn off loader
      await dispatch(toggleInitialDataLoading(false))
    })()
  }, [dispatch])

  useEffect(() => {
    setIsIOS(
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform),
    )
  }, [])

  const closeModalHandler = useCallback(() => dispatch(toggleRPCNodePopup(false)), [])

  const proccedPolicy = useCallback(() => {
    setCookie('policyPopup', true)
  }, [])

  return isInitialDataLoading || isInitialCtxLoading ? (
    <LoaderRocket />
  ) : (
    <Router>
      <AppStyled isExpandedMenu={sidebarOpened}>
        <ActionLoader />
        <Toaster />
        <WertLoader />
        <Menu />

        <SettingPopup isModalOpened={changeNodePopupOpen} closeModal={closeModalHandler} />
        <PolicyPopup isModalOpened={!isIOS && !policyPopup} proccedPolicy={proccedPolicy} />

        <LoansPopupsProvider>
          <AppRoutes />
        </LoansPopupsProvider>

        <Footer />
      </AppStyled>
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
