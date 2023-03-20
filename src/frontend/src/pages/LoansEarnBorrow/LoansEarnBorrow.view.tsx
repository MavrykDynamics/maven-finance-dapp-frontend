// components
import { EarnBorrowCard } from './Components/EarnBorrowCard.view'

// styles
import { LoansEarnBorrowStyled, EarnBorrowCards } from './LoansEarnBorrow.styles'
import { MarketsOverviewContainer } from 'pages/Loans/Loans.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

// helpers

// types
import { CardSettingsType, CardType } from './LoansEarnBorrow.consts'

type Props = {
  title: string
  cardSettings: CardSettingsType
  cards: CardType[]
}

export const LoansEarnBorrow = ({ title, cardSettings, cards }: Props) => {
  return (
    <LoansEarnBorrowStyled>
      <MarketsOverviewContainer>
        <GovRightContainerTitleArea>
          <h2>{title}</h2>
        </GovRightContainerTitleArea>
      </MarketsOverviewContainer>

      <EarnBorrowCards>
        {cards.map((item) => (
          <EarnBorrowCard key={item.id} card={item} settings={cardSettings} />
        ))}
      </EarnBorrowCards>
    </LoansEarnBorrowStyled>
  )
}
