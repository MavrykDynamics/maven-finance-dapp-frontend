import * as ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ThemeProvider } from 'styled-components'
import { QueryProvider } from 'providers/QueryProvider/query.provider'

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
  dappConfigContext,
  useDappConfigContext,
} from 'providers/DappConfigProvider/dappConfig.provider'
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'
import LoansProvider from 'providers/LoansProvider/loans.provider'
import DoormanProvider from 'providers/DoormanProvider/doorman.provider'
import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'
import ProposalsProvider from 'providers/ProposalsProvider/proposals.provider'
import VaultsProvider from 'providers/VaultsProvider/vaults.provider'
import ContractStatusesProvider from 'providers/ContractStatuses/ContractStatuses.provider'
import FinancialRequestsProvider from 'providers/FinancialRequestsProvider/financialRequests.provider'
import VestingProvider from 'providers/VestingProvider/vesting.provider'
import FarmsProvider from 'providers/FarmsProvider/farms.provider'
import TreasuryProvider from 'providers/TreasuryProvider/treasury.provider'
import CouncilProvider from 'providers/CouncilProvider/council.provider'
import SatelliteGovernanceProvider from 'providers/SatelliteGovernanceProvider/satelliteGovernance.provider'
import EGovProvider from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'

// components
import { ToasterMessages } from 'providers/ToasterProvider/components/ToasterMessages'
import { App } from './app/App.controller'
import { FullScreenLoadingApp } from 'app/App.style'
import { LottieLoader } from 'app/App.components/Loader/Loader.view'
import Mobile from './app/App.components/Mobile/Mobile.view'

// styles
import { GlobalStyle } from './styles'
import themeColors from 'styles/colors'
import './styles/fonts.css'
import './styles/animations.css'
import './styles/index.css'
import React from 'react'

const DappLibsProviders = ({ children }: { children: React.ReactNode }) => {
  const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''

  return (
    <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey} language="en">
      <Router>{children}</Router>
    </GoogleReCaptchaProvider>
  )
}

const InitialDataDappProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DappConfigProvider>
      <TokensProvider>
        <UserProvider>
          <DataFeedsProvider>
            <dappConfigContext.Consumer>
              {({ preferences: { themeSelected } }) => (
                <>
                  <ThemeProvider theme={themeColors[themeSelected]}>{children}</ThemeProvider>
                  <GlobalStyle theme={themeColors[themeSelected]} />
                </>
              )}
            </dappConfigContext.Consumer>
          </DataFeedsProvider>
        </UserProvider>
      </TokensProvider>
    </DappConfigProvider>
  )
}

const DappSectionsDataProviders = ({ children }: { children: React.ReactNode }) => {
  const { isLoading: isDappGeneralLoading } = useDappConfigContext()
  const { isLoading: isTokensLoading } = useTokensContext()
  const { isLoading: isFeedsLoading } = useDataFeedsContext()
  const { isLoading: isUserLoading, isUserRestored } = useUserContext()

  // use user loading status only on dapp init loading
  const isInitialUserLoading = !isUserRestored ? isUserLoading : false

  const isInitialLoading = isDappGeneralLoading || isTokensLoading || isFeedsLoading || isInitialUserLoading

  return (
    <>
      <LottieLoader isActive={isInitialLoading} backdropAlpha={1} />

      {isInitialLoading ? (
        <FullScreenLoadingApp />
      ) : (
        <ContractStatusesProvider>
          <ProposalsProvider>
            <DoormanProvider>
              <SatellitesProvider>
                <LoansProvider>
                  <VaultsProvider>
                    <EGovProvider>
                      <CouncilProvider>
                        <FarmsProvider>
                          <SatelliteGovernanceProvider>
                            <FinancialRequestsProvider>
                              <TreasuryProvider>
                                <VestingProvider>{children}</VestingProvider>
                              </TreasuryProvider>
                            </FinancialRequestsProvider>
                          </SatelliteGovernanceProvider>
                        </FarmsProvider>
                      </CouncilProvider>
                    </EGovProvider>
                  </VaultsProvider>
                </LoansProvider>
              </SatellitesProvider>
            </DoormanProvider>
          </ProposalsProvider>
        </ContractStatusesProvider>
      )}
    </>
  )
}

const AppContainer = () => {
  if (isMobile) return <Mobile />

  return (
    <>
      <LoansPopupsProvider>
        <ToasterMessages />
        <App />
      </LoansPopupsProvider>
    </>
  )
}

export const Root = () => {
  return (
    <DappLibsProviders>
      <ToasterProvider maintance={process.env.REACT_APP_MAINTANCE_MODE === 'on'}>
        <QueryProvider>
          <InitialDataDappProviders>
            <DappSectionsDataProviders>
              <AppContainer />
            </DappSectionsDataProviders>
          </InitialDataDappProviders>
        </QueryProvider>
      </ToasterProvider>
    </DappLibsProviders>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  // <React.StrictMode>
  <Root />,
  // </React.StrictMode>,
)

unregister()
reportWebVitals()
