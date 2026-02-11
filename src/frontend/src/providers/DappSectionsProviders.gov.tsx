import React from 'react'
import ContractStatusesProvider from 'providers/ContractStatuses/ContractStatuses.provider'
import ProposalsProvider from 'providers/ProposalsProvider/proposals.provider'
import DoormanProvider from 'providers/DoormanProvider/doorman.provider'
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'
import EGovProvider from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'
import CouncilProvider from 'providers/CouncilProvider/council.provider'
import SatelliteGovernanceProvider from 'providers/SatelliteGovernanceProvider/satelliteGovernance.provider'
import FinancialRequestsProvider from 'providers/FinancialRequestsProvider/financialRequests.provider'
import TreasuryProvider from 'providers/TreasuryProvider/treasury.provider'
import VestingProvider from 'providers/VestingProvider/vesting.provider'

export const GovSectionsProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ContractStatusesProvider>
      <ProposalsProvider>
        <DoormanProvider>
          <SatellitesProvider>
            <EGovProvider>
              <CouncilProvider>
                <SatelliteGovernanceProvider>
                  <FinancialRequestsProvider>
                    <TreasuryProvider>
                      <VestingProvider>{children}</VestingProvider>
                    </TreasuryProvider>
                  </FinancialRequestsProvider>
                </SatelliteGovernanceProvider>
              </CouncilProvider>
            </EGovProvider>
          </SatellitesProvider>
        </DoormanProvider>
      </ProposalsProvider>
    </ContractStatusesProvider>
  )
}
