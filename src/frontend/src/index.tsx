import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider as ReduxProvider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'

// apollo
import { client } from './apollo'

// utils
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { isMobile } from './utils/device-info'

// providers
import ToasterProvider from 'providers/ToasterProvider/toaster.provider'
import TokensProvider, { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import DataFeedsProvider, { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import UserProvider, { useUserContext } from 'providers/UserProvider/user.provider'
import DappConfigProvider, { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'
import StakeProvider from 'providers/StakeProvider/stake.provider'

import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App, store } from './app/App.controller'
import { FullScreenLoadingApp } from 'app/App.style'
import { LottieLoader } from 'app/App.components/Loader/Loader.view'
import Mobile from './app/App.components/Mobile/Mobile.view'

import { GlobalStyle } from './styles'
import './styles/fonts.css'
import './styles/animations.css'
import './styles/index.css'
import './styles/fonts.css'
import './styles/animations.css'

const DappLibsProviders = ({ children }: { children: React.ReactNode }) => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <ReduxProvider store={store}>
          <Router>{children}</Router>
        </ReduxProvider>
      </ApolloProvider>
    </GoogleReCaptchaProvider>
  )
}

const InitialDataDappProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TokensProvider>
      <UserProvider>
        <DataFeedsProvider>
          <DappConfigProvider>{children}</DappConfigProvider>
        </DataFeedsProvider>
      </UserProvider>
    </TokensProvider>
  )
}

const DappSectionsDataProviders = ({ children }: { children: React.ReactNode }) => {
  const { isLoading: isDappGeneralLoading } = useDappConfigContext()
  const { isLoading: isTokensLoading } = useTokensContext()
  const { isLoading: isFeedsLoading } = useDataFeedsContext()
  const { isLoading: isUserLoading } = useUserContext()

  const isInitialLoading = isDappGeneralLoading || isTokensLoading || isFeedsLoading || isUserLoading

  return (
    <>
      <LottieLoader isActive={isInitialLoading} backdropAlpha={1} />

      {isInitialLoading ? (
        <FullScreenLoadingApp />
      ) : (
        <StakeProvider>
          <SatellitesProvider>{children}</SatellitesProvider>
        </StakeProvider>
      )}
    </>
  )
}

const AppContainer = () => {
  if (isMobile) return <Mobile />

  return (
    <>
      <GlobalStyle />
      <ToasterMessages />
      <App />
    </>
  )
}

export const Root = () => {
  return (
    <DappLibsProviders>
      <ToasterProvider>
        <DarkThemeProvider>
          <InitialDataDappProviders>
            <DappSectionsDataProviders>
              <AppContainer />
            </DappSectionsDataProviders>
          </InitialDataDappProviders>
        </DarkThemeProvider>
      </ToasterProvider>
    </DappLibsProviders>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
