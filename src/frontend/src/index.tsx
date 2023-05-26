import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'

// apollo
import { client } from './apollo'

import { App, store } from './app/App.controller'
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { GlobalStyle } from './styles'
import { isMobile } from './utils/device-info'
import Mobile from './app/App.components/Mobile/Mobile.view'

// providers
import DAPPConfigProvider, { dappContext } from 'providers/DAPPConfig/dappConfig.provider'
import DataFeedsProvider from 'providers/DataFeedsProvider/dataFeeds.provider'
import TokensProvider from 'providers/TokensProvider/tokens.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'

import './styles/fonts.css'
import './styles/animations.css'

// TODO: implement tokens context while tokens reorganization task
export const Root = () => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <Provider store={store}>
          <DAPPConfigProvider>
            <dappContext.Consumer>
              {(value) => (
                <DataFeedsProvider dipDupContracts={value.dipDupContracts}>
                  <TokensProvider>
                    <DarkThemeProvider>
                      <GlobalStyle />
                      {isMobile ? <Mobile /> : <App />}
                    </DarkThemeProvider>
                  </TokensProvider>
                </DataFeedsProvider>
              )}
            </dappContext.Consumer>
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
