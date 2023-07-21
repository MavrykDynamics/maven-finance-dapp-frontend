// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FinancialRequestsView } from './FinancialRequests.view'
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { useFinancialRequestsContext } from 'providers/FinancialRequestsProvider/financialRequests.provider'

export const FinancialRequests = () => {
  const { pastFinancialRequestsIds, ongoingFinancialRequestsIds, financialRequestsMapper, isLoading } =
    useFinancialRequestsContext()

  return (
    <Page>
      <PageHeader page={'financial requests'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading financial requests</div>
        </DataLoaderWrapper>
      ) : Object.keys(financialRequestsMapper)?.length ? (
        <FinancialRequestsView
          ongoingFinancialRequestsIds={ongoingFinancialRequestsIds}
          pastFinancialRequestsIds={pastFinancialRequestsIds}
          financialRequestsMapper={financialRequestsMapper}
        />
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No financial requests to show" />
          <figcaption>No Requests to show</figcaption>
        </EmptyContainer>
      )}
    </Page>
  )
}
