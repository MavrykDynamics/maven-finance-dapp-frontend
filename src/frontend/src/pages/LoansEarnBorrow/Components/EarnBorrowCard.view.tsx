// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import Icon from 'app/App.components/Icon/Icon.view'
import { EarnBorrowChart } from './EarnBorrowChart.view'
import Button from 'app/App.components/Button/NewButton'

// styles
import { EarnBorrowCardStyled, EarnBorrowCardHeader, EarnBorrowCardBody } from '../LoansEarnBorrow.styles'

// helpers
import { BUTTON_PRIMARY, BUTTON_WIDE, BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'

// types
import { MarketSettingsType, MarketType } from '../LoansEarnBorrow.consts'

type Props = {
  market: MarketType
  settings: MarketSettingsType
  userAddress?: string
}

export const EarnBorrowCard = ({ market, settings, userAddress }: Props) => {
  const { priceName, totalName, buttonName, buttonSymbol } = settings
  const { name, icon, symbol, annualRate, annualRateName, totalAmount, price, chartData } = market

  return (
    <EarnBorrowCardStyled>
      <EarnBorrowCardHeader>
        <div className="flex">
          <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
          <h4>{name}</h4>
          &nbsp;
          <span>({symbol})</span>
        </div>

        <div className="flex commaNumber">
          <CommaNumber value={annualRate} />% &nbsp;{annualRateName}
        </div>
      </EarnBorrowCardHeader>

      <EarnBorrowCardBody>
        <div className="info">
          <span>{priceName}</span>
          <span>{totalName}</span>
        </div>

        <div className="info">
          <CommaNumber beginningText="$" value={price} />
          <CommaNumber beginningText="$" value={totalAmount} />
        </div>

        <EarnBorrowChart data={chartData} />

        <div className="buttons">
          <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={!userAddress}>
            <Icon id="loans" />
            {buttonName}
            {buttonSymbol && <span>{symbol}</span>}
          </Button>

          <Button kind={BUTTON_SIMPLE} form={BUTTON_WIDE}>
            View Stats
            <Icon id="arrow" className="arrowIcon" />
          </Button>
        </div>
      </EarnBorrowCardBody>
    </EarnBorrowCardStyled>
  )
}
