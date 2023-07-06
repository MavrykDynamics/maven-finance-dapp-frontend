import { useCallback, useEffect, useState } from 'react'
import { AnyAction } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { useMedia } from 'react-use'
import { ThunkDispatch } from 'redux-thunk'
import { useCookies } from 'react-cookie'

import { configureStore } from './App.store'

// providers
import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { State } from '../reducers'

// view, styles
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { Menu } from './App.components/Menu/Menu.controller'
import { ActionLoader, WertLoader } from './App.components/Loader/Loader.view'
import { SettingPopup } from './App.components/SettingsPopup/SettingsPopup'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { AppStyled } from './App.style'
import { PolicyPopup } from 'app/App.components/PolicyPopup/Policy.controller'
import { Footer } from './App.components/Footer/Footer'

// actions
import { toggleSidebarCollapsing } from './App.components/Menu/Menu.actions'
import { getContractAddressesStorage } from 'reducers/actions/contractAddresses.actions'
import { toggleRPCNodePopup } from './App.components/SettingsPopup/SettingsPopup.actions'
import { useUserContext } from 'providers/UserProvider/user.provider'

export const { store } = configureStore({})
export type AppDispatch = ThunkDispatch<State, unknown, AnyAction>
export type GetState = typeof store.getState

export const App = () => {
  const dispatch = useDispatch()

  const { isLoading: isDappGeneralLoading } = useDappConfigContext()
  const { isLoading: isTokensLoading } = useTokensContext()
  const { isLoading: isFeedsLoading } = useDataFeedsContext()
  const { isLoading: isUserLoading } = useUserContext()

  const showSidebarOpened = useMedia('(min-width: 1400px)')
  const [{ policyPopup }, setCookie] = useCookies(['policyPopup'])

  const { changeNodePopupOpen, sidebarOpened } = useSelector((state: State) => state.preferences)

  useEffect(() => {
    dispatch(getContractAddressesStorage())
  }, [])

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  // IOS mobile handle
  const [isIOS, setIsIOS] = useState(true)

  useEffect(() => {
    setIsIOS(
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform),
    )
  }, [])

  const closeModalHandler = useCallback(() => dispatch(toggleRPCNodePopup(false)), [])
  const proccedPolicy = useCallback(() => setCookie('policyPopup', true), [])

  const isInitialLoading = isDappGeneralLoading || isTokensLoading || isFeedsLoading || isUserLoading

  return (
    <AppStyled isExpandedMenu={sidebarOpened} isVisible={!isInitialLoading}>
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
  )
}
