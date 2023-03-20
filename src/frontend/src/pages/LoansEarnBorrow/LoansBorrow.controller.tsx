// components
import { Page } from 'styles'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'

// styles
import { LoansEarnBorrowStyled } from './LoansEarnBorrow.styles'

export const LoansBorrow = () => {
  return (
    <Page>
      <PageHeader page={'loansBorrow'} />
      <LoansEarnBorrowStyled></LoansEarnBorrowStyled>
    </Page>
  )
}
