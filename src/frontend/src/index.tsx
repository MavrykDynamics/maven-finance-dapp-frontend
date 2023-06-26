import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
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
import DAPPConfigProvider from 'providers/DAPPConfig/dappConfig.provider'
import DataFeedsProvider from 'providers/DataFeedsProvider/dataFeeds.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'

import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App, store } from './app/App.controller'
import Mobile from './app/App.components/Mobile/Mobile.view'

import './styles/fonts.css'
import './styles/animations.css'
import UserProvider from 'providers/UserProvider/user.provider'
import StakeProvider from 'providers/StakeProvider/stake.provider'
import { GlobalStyle } from './styles'
import './styles/fonts.css'
import './styles/animations.css'
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'

export const Root = () => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <Provider store={store}>
          <DAPPConfigProvider>
            <DataFeedsProvider>
              <TokensProvider>
                <UserProvider>
                  <StakeProvider>
                    <SatellitesProvider>
                      <DarkThemeProvider>
                        <GlobalStyle />
                        <ToasterProvider>
                          {isMobile ? <Mobile /> : <App />}
                          <ToasterMessages />
                        </ToasterProvider>
                      </DarkThemeProvider>
                    </SatellitesProvider>
                  </StakeProvider>
                </UserProvider>
              </TokensProvider>
            </DataFeedsProvider>
          </DAPPConfigProvider>
        </Provider>
      </ApolloProvider>
    </GoogleReCaptchaProvider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
