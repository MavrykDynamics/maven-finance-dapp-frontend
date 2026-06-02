import React from 'react'
import { BrowserRouter as Router } from 'react-router'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ThemeProvider } from 'styled-components'
import { QueryProvider } from 'providers/QueryProvider/query.provider'

// providers
import ToasterProvider from 'providers/ToasterProvider/toaster.provider'
import TokensProvider, { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import DataFeedsProvider from 'providers/DataFeedsProvider/dataFeeds.provider'
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

// styles
import { GlobalStyle } from './styles'
import themeColors from 'styles/colors'
import './styles/fonts.css'
import './styles/animations.css'
import './styles/index.css'

const DappLibsProviders = ({ children }: { children: React.ReactNode }) => {
  const reCaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''

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
  const { isLoading: isUserLoading, isUserRestored } = useUserContext()

  // use user loading status only on dapp init loading
  const isInitialUserLoading = !isUserRestored ? isUserLoading : false

  // DataFeeds removed from gate — only needed on Satellites/DataFeeds pages, loads in background
  const isInitialLoading = isDappGeneralLoading || isTokensLoading || isInitialUserLoading

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
  return (
    <LoansPopupsProvider>
      <ToasterMessages />
      <App />
    </LoansPopupsProvider>
  )
}

export const DesktopApp = () => {
  return (
    <DappLibsProviders>
      <ToasterProvider maintance={import.meta.env.VITE_MAINTANCE_MODE === 'on'}>
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
