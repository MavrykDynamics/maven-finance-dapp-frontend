import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'

// apollo
import { client } from './apollo'

// utils
import { App, store } from './app/App.controller'
import reportWebVitals from './reportWebVitals'
import { isMobile } from './utils/device-info'
import { unregister } from './serviceWorker'

// view
import { GlobalStyle } from './styles'
import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import Mobile from './app/App.components/Mobile/Mobile.view'

// providers
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'
import DAPPConfigProvider from 'providers/DAPPConfig/dappConfig.provider'
import DataFeedsProvider from 'providers/DataFeedsProvider/dataFeeds.provider'
import TokensProvider from 'providers/TokensProvider/tokens.provider'
import ToasterProvider from 'providers/ToasterProvider/toaster.provider'
import UserProvider from 'providers/UserProvider/user.provider'
import StakeProvider from 'providers/StakeProvider/stake.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'

import './styles/fonts.css'
import './styles/animations.css'

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
                  <SatellitesProvider>
                    <StakeProvider>
                      <DarkThemeProvider>
                        <GlobalStyle />
                        <ToasterProvider>
                          {isMobile ? <Mobile /> : <App />}
                          <ToasterMessages />
                        </ToasterProvider>
                      </DarkThemeProvider>
                    </StakeProvider>
                  </SatellitesProvider>
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
