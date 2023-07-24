import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { ApolloProvider } from 'providers/ApolloProvider/apollo.provider'

// utils
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { isMobile } from './utils/device-info'

// providers
import ToasterProvider from 'providers/ToasterProvider/toaster.provider'
import TokensProvider, { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import DataFeedsProvider, { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import UserProvider, { useUserContext } from 'providers/UserProvider/user.provider'
import DappConfigProvider, {
  useDappConfigContext,
  dappConfigContext,
} from 'providers/DappConfigProvider/dappConfig.provider'
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'
import LoansProvider from 'providers/LoansProvider/loans.provider'
import DoormanProvider from 'providers/DoormanProvider/doorman.provider'
import VaultsProvider from 'providers/VaultsProvider/vaults.provider'

// components
import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App, store } from './app/App.controller'
import { FullScreenLoadingApp } from 'app/App.style'
import { LottieLoader } from 'app/App.components/Loader/Loader.view'
import Mobile from './app/App.components/Mobile/Mobile.view'

import { GlobalStyle } from './styles'
import themeColors from 'styles/colors'
import './styles/fonts.css'
import './styles/animations.css'
import './styles/index.css'
import './styles/fonts.css'
import './styles/animations.css'

const DappLibsProviders = ({ children }: { children: React.ReactNode }) => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ReduxProvider store={store}>
        <Router>{children}</Router>
      </ReduxProvider>
    </GoogleReCaptchaProvider>
  )
}

const InitialDataDappProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TokensProvider>
      <UserProvider>
        <DataFeedsProvider>
          <DappConfigProvider>
            <dappConfigContext.Consumer>
              {({ preferences: { themeSelected } }) => (
                <ThemeProvider theme={themeColors[themeSelected]}>{children}</ThemeProvider>
              )}
            </dappConfigContext.Consumer>
          </DappConfigProvider>
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
        <DoormanProvider>
          <SatellitesProvider>
            <LoansProvider>
              <VaultsProvider>{children}</VaultsProvider>
            </LoansProvider>
          </SatellitesProvider>
        </DoormanProvider>
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
        <ApolloProvider>
          <InitialDataDappProviders>
            <DappSectionsDataProviders>
              <AppContainer />
            </DappSectionsDataProviders>
          </InitialDataDappProviders>
        </ApolloProvider>
      </ToasterProvider>
    </DappLibsProviders>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
