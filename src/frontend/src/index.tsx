import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'

// apollo
import { client } from './apollo'

// import { PersistGate } from "redux-persist/integration/react";

// import { App, store, persistor } from "./app/App.controller";
import { App, store } from './app/App.controller'
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { GlobalStyle } from './styles'
import { isMobile } from './utils/device-info'
import Mobile from './app/App.components/Mobile/Mobile.view'

// providers
import DAPPConfigProvider from 'providers/DAPPConfig/dappConfig.provider'
import DataFeedsProvider, { dataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import TokensProvider from 'providers/TokensProvider/tokens.provider'
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
              <dataFeedsContext.Consumer>
                {(value) => (
                  <TokensProvider feedsLedger={value.feedsLedger}>
                    {/* <PersistGate loading={null} persistor={persistor}> */}
                    <DarkThemeProvider>
                      <GlobalStyle />
                      {isMobile ? <Mobile /> : <App />}
                    </DarkThemeProvider>
                    {/* </PersistGate> */}
                  </TokensProvider>
                )}
              </dataFeedsContext.Consumer>
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
