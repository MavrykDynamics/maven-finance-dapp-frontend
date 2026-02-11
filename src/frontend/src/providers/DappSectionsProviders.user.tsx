import React from 'react'
import ContractStatusesProvider from 'providers/ContractStatuses/ContractStatuses.provider'
import DoormanProvider from 'providers/DoormanProvider/doorman.provider'
import SatellitesProvider from 'providers/SatellitesProvider/satellites.provider'
import LoansProvider from 'providers/LoansProvider/loans.provider'
import VaultsProvider from 'providers/VaultsProvider/vaults.provider'
import EGovProvider from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'
import FarmsProvider from 'providers/FarmsProvider/farms.provider'
import LoansPopupsProvider from 'providers/LoansProvider/LoansModals.provider'

export const UserSectionsProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ContractStatusesProvider>
      <DoormanProvider>
        <SatellitesProvider>
          <LoansProvider>
            <VaultsProvider>
              <EGovProvider>
                <FarmsProvider>
                  <LoansPopupsProvider>{children}</LoansPopupsProvider>
                </FarmsProvider>
              </EGovProvider>
            </VaultsProvider>
          </LoansProvider>
        </SatellitesProvider>
      </DoormanProvider>
    </ContractStatusesProvider>
  )
}
