import { useCallback, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AnyAction } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { useMedia } from 'react-use'
import { ThunkDispatch } from 'redux-thunk'
import { configureStore } from './App.store'

// types
import { State } from '../reducers'

// view, styles
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { Menu } from './App.components/Menu/Menu.controller'
import { PopupChangeNode } from './App.components/SettingsPopup/SettingsPopup.controller'
import { ActionLoader, LoaderRocket, WertLoader } from './App.components/Loader/Loader.view'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { AppStyled } from './App.style'
import LoansPopupsProvider from 'pages/Loans/Components/Modals/LoansModals.provider'

// actions
import { toggleSidebarCollapsing } from './App.components/Menu/Menu.actions'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { getContractAddressesStorage } from 'reducers/actions/contractAddresses.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'
import { connect } from './App.components/ConnectWallet/ConnectWallet.actions'
import { toggleInitialDataLoading } from './App.components/Loader/Loader.action'
import { toggleRPCNodePopup } from './App.components/SettingsPopup/SettingsPopup.actions'
import {
  getDipDupTokensStorage,
  getWhitelistTokensStorage,
  getTokensPrices,
  getMTokensStorage,
} from 'reducers/actions/dipDupActions.actions'
import { getCouncilMembers } from 'pages/Council/Council.actions'
import { getBreakGlassCouncilMembers } from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'

// export const { store, persistor } = configureStore({})
export const { store } = configureStore({})
export type AppDispatch = ThunkDispatch<State, unknown, AnyAction>
export type GetState = typeof store.getState

const AppContainer = () => {
  const dispatch = useDispatch()
  const { changeNodePopupOpen, sidebarOpened } = useSelector((state: State) => state.preferences)
  const { isInitialDataLoading } = useSelector((state: State) => state.loading)
  const showSidebarOpened = useMedia('(min-width: 1400px)')

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  useEffect(() => {
    ;(async () => {
      // Fetching initial&common data for DAPP
      await Promise.all([
        dispatch(getSatellitesStorage()),
        dispatch(getFeedsStorage()),

        dispatch(getContractAddressesStorage()),
        dispatch(getDipDupTokensStorage()),
        dispatch(getWhitelistTokensStorage()),
        dispatch(getMTokensStorage()),

        // Used to retrieve user avatar
        dispatch(getCouncilMembers()),
        dispatch(getBreakGlassCouncilMembers()),
      ])

      // Depends on data feeds (getFeedsStorage())
      await dispatch(getTokensPrices())

      // For using Beacon wallet
      if (
        localStorage.getItem('beacon:active-account') &&
        localStorage.getItem('beacon:active-account') !== 'undefined'
      ) {
        await dispatch(connect())
      }

      await dispatch(toggleInitialDataLoading(false))
    })()
  }, [dispatch])

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  const closeModalHandler = useCallback(() => dispatch(toggleRPCNodePopup(false)), [])

  return isInitialDataLoading ? (
    <LoaderRocket />
  ) : (
    <Router>
      <AppStyled isExpandedMenu={sidebarOpened}>
        <ActionLoader />
        <WertLoader />
        <Menu />
        <PopupChangeNode isModalOpened={changeNodePopupOpen} closeModal={closeModalHandler} />

        <LoansPopupsProvider>
          <AppRoutes />
        </LoansPopupsProvider>
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
