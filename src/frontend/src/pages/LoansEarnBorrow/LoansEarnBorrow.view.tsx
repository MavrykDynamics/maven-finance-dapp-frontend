import { useSelector } from 'react-redux'
import { State } from 'reducers'

// styles
import { LoansEarnBorrowStyled, EarnBorrowCards } from './LoansEarnBorrow.styles'
import { MarketsOverviewContainer } from 'pages/Loans/Loans.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

// types
import { MarketSettingsType } from './LoansEarnBorrow.consts'
import { LoansStorage } from 'utils/TypesAndInterfaces/Loans'

type Props = {
  title: string
  cardSettings: MarketSettingsType
  cards: LoansStorage['loanTokens']
  children: React.ReactNode
}

export const LoansEarnBorrow = ({ title, cardSettings, cards, children: markets }: Props) => {
  const { accountPkh } = useSelector((state: State) => state.wallet)

  return (
    <LoansEarnBorrowStyled>
      <MarketsOverviewContainer>
        <GovRightContainerTitleArea>
          <h2>{title}</h2>
        </GovRightContainerTitleArea>
      </MarketsOverviewContainer>

      <EarnBorrowCards>{markets}</EarnBorrowCards>
    </LoansEarnBorrowStyled>
  )
}
