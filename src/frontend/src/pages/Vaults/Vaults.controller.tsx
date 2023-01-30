import * as React from 'react'

// components
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { VaultsView } from './Vaults.view'

// helpers
import LoansPopupsProvider from '../Loans/Components/Modals/LoansModals.provider'

// styles
import { Page } from 'styles'

export const Vaults = () => {
  return (
    <LoansPopupsProvider>
      <Page>
        <PageHeader page={'vaults'} />
        <VaultsView />
      </Page>
    </LoansPopupsProvider>
  )
}
