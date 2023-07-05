import ReactDOM from 'react-dom'
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
import TokensProvider from 'providers/TokensProvider/tokens.provider'
import DataFeedsProvider from 'providers/DataFeedsProvider/dataFeeds.provider'
import UserProvider from 'providers/UserProvider/user.provider'
import DappConfigProvider from 'providers/DappConfigProvider/dappConfig.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'
import StakeProvider from 'providers/StakeProvider/stake.provider'

import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App, store } from './app/App.controller'
import Mobile from './app/App.components/Mobile/Mobile.view'

import { GlobalStyle } from './styles'
import './styles/fonts.css'
import './styles/animations.css'
import './styles/fonts.css'
import './styles/animations.css'

const DappLibsProviders = ({ children }: { children: React.ReactNode }) => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <ReduxProvider store={store}>{children}</ReduxProvider>
      </ApolloProvider>
    </GoogleReCaptchaProvider>
  )
}

const InitialDataDappProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TokensProvider>
      <DataFeedsProvider>
        <UserProvider>
          <DappConfigProvider>{children}</DappConfigProvider>
        </UserProvider>
      </DataFeedsProvider>
    </TokensProvider>
  )
}

const DappSectionsDataProviders = ({ children }: { children: React.ReactNode }) => {
  return <StakeProvider>{children}</StakeProvider>
}

export const Root = () => {
  return (
    <DappLibsProviders>
      <DarkThemeProvider>
        <ToasterProvider>
          <InitialDataDappProviders>
            <DappSectionsDataProviders>
              <GlobalStyle />
              {isMobile ? <Mobile /> : <App />}
              <ToasterMessages />
            </DappSectionsDataProviders>
          </InitialDataDappProviders>
        </ToasterProvider>
      </DarkThemeProvider>
    </DappLibsProviders>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
