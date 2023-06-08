// components
import { EarnBorrowCard } from './Components/EarnBorrowCard.view'

// styles
import { LoansEarnBorrowStyled, EarnBorrowCards } from './LoansEarnBorrow.styles'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

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
      <H2Title>{title}</H2Title>

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
