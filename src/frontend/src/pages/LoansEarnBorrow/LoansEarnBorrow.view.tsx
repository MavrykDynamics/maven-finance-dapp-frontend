// components
import { MarketsOverviewContainer } from 'pages/Loans/Loans.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

// styles
import { LoansEarnBorrowStyled } from './LoansEarnBorrow.styles'

// helpers
// types

type Props = {
  title: string
}

export const LoansEarnBorrow = ({ title }: Props) => {
  return (
    <LoansEarnBorrowStyled>
      <MarketsOverviewContainer>
        <GovRightContainerTitleArea>
          <h2>{title}</h2>
        </GovRightContainerTitleArea>
      </MarketsOverviewContainer>
    </LoansEarnBorrowStyled>
  )
}
