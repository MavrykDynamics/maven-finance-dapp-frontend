import { useEffect } from 'react'
// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FinancialRequestsView } from './FinancialRequests.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// styles
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// providers
import { useFinancialRequestsContext } from 'providers/FinancialRequestsProvider/financialRequests.provider'

// consts
import {
  ALL_FIN_REQUESTS_SUB,
  DEFAULT_FIN_REQUESTS_ACTIVE_SUBS,
  FIN_REQUESTS_DATA,
} from 'providers/FinancialRequestsProvider/helpers/financialRequests.consts'

export const FinancialRequests = () => {
  const {
    pastFinRequestsIds,
    ongoingFinRequestsIds,
    financialRequestsMapper,
    allFinRequestsIds,
    isLoading,
    changeFinancialRequestsSubscriptionList,
  } = useFinancialRequestsContext()

  useEffect(() => {
    changeFinancialRequestsSubscriptionList({
      [FIN_REQUESTS_DATA]: ALL_FIN_REQUESTS_SUB,
    })

    return () => {
      changeFinancialRequestsSubscriptionList(DEFAULT_FIN_REQUESTS_ACTIVE_SUBS)
    }
  }, [])

  return (
    <Page>
      <PageHeader page={'financial requests'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading financial requests</div>
        </DataLoaderWrapper>
      ) : allFinRequestsIds.length ? (
        <FinancialRequestsView
          ongoingFinancialRequestsIds={ongoingFinRequestsIds}
          pastFinancialRequestsIds={pastFinRequestsIds}
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
