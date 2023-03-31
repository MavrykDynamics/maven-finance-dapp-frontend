// components
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { VaultsView } from './Vaults.view'

// styles
import { Page } from 'styles'

export const Vaults = () => {
  return (
    <Page>
      <PageHeader page={'vaults'} />
      <VaultsView />
    </Page>
  )
}
