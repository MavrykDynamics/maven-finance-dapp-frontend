import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'

// apollo
import { ApolloProvider } from 'providers/ApolloProvider/apollo.provider'

// utils
import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'
import { isMobile } from './utils/device-info'

// providers
import ToasterProvider from 'providers/ToasterProvider/toaster.provider'
import DarkThemeProvider from './app/App.components/DarkThemeProvider/DarkThemeProvider.view'

import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App, store } from './app/App.controller'
import Mobile from './app/App.components/Mobile/Mobile.view'

import { GlobalStyle } from './styles'
import './styles/index.css'
import './styles/fonts.css'
import './styles/animations.css'
import DappConfigProvider from 'providers/DappConfigProvider/dappConfig.provider'

export const Root = () => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <Provider store={store}>
        <DarkThemeProvider>
          <ToasterProvider>
            <ApolloProvider>
              <DappConfigProvider>
                <GlobalStyle />
                {isMobile ? <Mobile /> : <App />}
              </DappConfigProvider>
              <ToasterMessages />
            </ApolloProvider>
          </ToasterProvider>
        </DarkThemeProvider>
      </Provider>
    </GoogleReCaptchaProvider>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Root />, rootElement)

unregister()
reportWebVitals()
