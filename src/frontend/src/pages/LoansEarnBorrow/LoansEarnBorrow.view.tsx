// components
import { EarnBorrowCard } from './Components/EarnBorrowCard.view'

// styles
import { LoansEarnBorrowStyled, EarnBorrowCards } from './LoansEarnBorrow.styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

// types
import { MarketType, MarketSettingsType } from './LoansEarnBorrow.consts'

type Props = {
  title: string
  markets: MarketType[]
  settings: MarketSettingsType
  handleClick: (marketSymbol: string) => void
  isDisabledButton?: boolean
}

export const LoansEarnBorrow = ({ title, markets, settings, handleClick, isDisabledButton }: Props) => {
  return (
    <LoansEarnBorrowStyled>
      <GovRightContainerTitleArea>
        <h2>{title}</h2>
      </GovRightContainerTitleArea>

      <EarnBorrowCards>
        {markets.map((item) => (
          <EarnBorrowCard
            key={item.symbol}
            market={item}
            settings={settings}
            onClick={handleClick}
            isDisabledButton={isDisabledButton}
          />
        ))}
      </EarnBorrowCards>
    </LoansEarnBorrowStyled>
  )
}
