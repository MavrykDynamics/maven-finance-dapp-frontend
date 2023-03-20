// components
import { Page } from 'styles'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'

// styles
import { LoansEarnBorrowStyled } from './LoansEarnBorrow.styles'

export const LoansEarn = () => {
  return (
    <Page>
      <PageHeader page={'loansEarn'} />
      <LoansEarnBorrowStyled>

      </LoansEarnBorrowStyled>
    </Page>
  )
}
