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
import BrealGlassProvider from 'providers/ContractStatusesProvider/contractStatus.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'

import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App, store } from './app/App.controller'
import Mobile from './app/App.components/Mobile/Mobile.view'

import { GlobalStyle } from './styles'
import './styles/fonts.css'
import './styles/animations.css'

export const Root = () => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <Provider store={store}>
          <BrealGlassProvider>
            <DarkThemeProvider>
              <GlobalStyle />
              <ToasterProvider>
                {isMobile ? <Mobile /> : <App />}
                <ToasterMessages />
              </ToasterProvider>
            </DarkThemeProvider>
          </BrealGlassProvider>
        </Provider>
      </ApolloProvider>
    </GoogleReCaptchaProvider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
