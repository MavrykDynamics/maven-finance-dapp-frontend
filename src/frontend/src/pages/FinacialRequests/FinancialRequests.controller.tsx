import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from '../../reducers'

//  actions
import { getGovernanceStorage } from '../Governance/Governance.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FinancialRequestsView } from './FinancialRequests.view'

//styles
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'

export const FinancialRequests = () => {
  const dispatch = useDispatch()

  const {
    governanceStorage: { financialRequestLedger },
  } = useSelector((state: State) => state.governance)

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'financial requests'} />
      {financialRequestLedger?.length ? (
        <FinancialRequestsView financialRequestsList={financialRequestLedger} />
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No financial requests to show" />
          <figcaption>No Requests to show</figcaption>
        </EmptyContainer>
      )}
    </Page>
  )
}
