import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from '../../reducers'

//  actions
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getFinancialRequestStorage } from './FiancialRequest.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FinancialRequestsView } from './FinancialRequests.view'
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

export const FinancialRequests = () => {
  const dispatch = useDispatch()

  const { financialRequests, isLoaded: isFinancialRequestsLoaded } = useSelector(
    (state: State) => state.financialRequest,
  )

  const { isLoading } = useDataLoader(async () => {
    if (!isFinancialRequestsLoaded) {
      await dispatch(getFinancialRequestStorage())
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
      ) : financialRequests?.length ? (
        <FinancialRequestsView financialRequestsList={financialRequests} />
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No financial requests to show" />
          <figcaption>No Requests to show</figcaption>
        </EmptyContainer>
      )}
    </Page>
  )
}
