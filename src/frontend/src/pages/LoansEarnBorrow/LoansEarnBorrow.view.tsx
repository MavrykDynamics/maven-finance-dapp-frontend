// styles
import { LoansEarnBorrowStyled, EarnBorrowCards } from './LoansEarnBorrow.styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

type Props = {
  title: string
  children: React.ReactNode
}

export const LoansEarnBorrow = ({ title, children }: Props) => {
  return (
    <LoansEarnBorrowStyled>
      <GovRightContainerTitleArea>
        <h2>{title}</h2>
      </GovRightContainerTitleArea>

      <EarnBorrowCards>{children}</EarnBorrowCards>
    </LoansEarnBorrowStyled>
  )
}
