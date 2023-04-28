import * as React from 'react'
import ReactDOM from 'react-dom'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Provider } from 'react-redux'
import { ApolloProvider, ApolloClient, InMemoryCache, split } from '@apollo/client'
import { HttpLink } from '@apollo/client/link/http'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
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

// apollo client setup
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_API ?? '',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.mavryk.finance/v1/graphql',
  }),
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export const Root = () => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''
  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <ApolloProvider client={client}>
        <Provider store={store}>
          {/* <PersistGate loading={null} persistor={persistor}> */}
          <DarkThemeProvider>
            <GlobalStyle />
            {isMobile ? <Mobile /> : <App />}
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
