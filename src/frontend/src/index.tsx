import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client'

// apollo
import { client } from './apollo'

// import { PersistGate } from "redux-persist/integration/react";

import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'
// import { App, store, persistor } from "./app/App.controller";
import { App, store } from './app/App.controller'
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { GlobalStyle } from './styles'
import { isMobile } from './utils/device-info'
import Mobile from './app/App.components/Mobile/Mobile.view'

import './styles/fonts.css'
import './styles/animations.css'
import ToasterProvider from 'providers/ToasterProvider/toaster.provider'
import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'

export const Root = () => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <Provider store={store}>
          {/* <PersistGate loading={null} persistor={persistor}> */}
          <DarkThemeProvider>
            <GlobalStyle />
            <ToasterProvider>
              {isMobile ? <Mobile /> : <App />}
              <ToasterMessages />
            </ToasterProvider>
          </DarkThemeProvider>
          {/* </PersistGate> */}
        </Provider>
      </ApolloProvider>
    </GoogleReCaptchaProvider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
