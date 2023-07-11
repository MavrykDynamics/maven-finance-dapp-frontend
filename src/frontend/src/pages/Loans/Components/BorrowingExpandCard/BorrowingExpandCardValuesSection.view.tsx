// styles
import { LoansValuesSection, LoansValuesSectionInfo } from '../LoansComponents.style'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'

// consts & helpers
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import colors from 'styles/colors'
import { ACCRUED_INTEREST, APR, BORROW_CAPACITY, COLLATERAL_VALUE, OUTSTANDING_DEBT } from 'texts/tooltips/vault.text'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type Props = {
  collateralRatio: number
  collateralBalance: number
  borrowedAmount: number
  borrowCapacity: number
  decimals: number
  fee: number
  apr: number
  rate: number
}

export const BorrowingExpandCardValuesSection = ({
  collateralRatio,
  collateralBalance,
  borrowedAmount,
  borrowCapacity,
  decimals,
  fee,
  apr,
  rate,
}: Props) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  return (
    <LoansValuesSection className="borrowing-tab">
      <div className="stats">
        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={borrowedAmount + fee} className="value" showDecimal decimalsToShow={decimals} />

          <CommaNumber
            value={(borrowedAmount + fee) * rate}
            beginningText="$"
            className="rate"
            showDecimal
            decimalsToShow={decimals}
          />

          <div className="name">
            Outstanding Debt
            <CustomTooltip iconId="info" text={OUTSTANDING_DEBT} defaultStrokeColor={colors[themeSelected].textColor} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={borrowedAmount} decimalsToShow={decimals} className="value" />
          <CommaNumber value={borrowedAmount * rate} decimalsToShow={2} beginningText="$" className="rate" />
          <div className="name">Principle</div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={collateralBalance} className="value" beginningText="$" showDecimal decimalsToShow={2} />
          <div className="name margin-top">
            Collateral Value
            <CustomTooltip iconId="info" text={COLLATERAL_VALUE} defaultStrokeColor={colors[themeSelected].textColor} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={fee} decimalsToShow={decimals} className="value" />
          <CommaNumber value={fee * rate} decimalsToShow={2} beginningText="$" className="rate" />
          <div className="name">
            Accrued Interest
            <CustomTooltip iconId="info" text={ACCRUED_INTEREST} defaultStrokeColor={colors[themeSelected].textColor} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
          <div className="name margin-top">
            APR
            <CustomTooltip iconId="info" text={APR} defaultStrokeColor={colors[themeSelected].textColor} />
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={borrowCapacity} className="value" beginningText="$" showDecimal decimalsToShow={2} />
          <div className="name margin-top">
            Borrow Capacity
            <CustomTooltip iconId="info" text={BORROW_CAPACITY} defaultStrokeColor={colors[themeSelected].textColor} />
          </div>
        </LoansValuesSectionInfo>
      </div>
      <LoansValuesSectionInfo className="collateral-diagram" customColor={getCollateralRationPersent(collateralRatio)}>
        <div className="percentage">
          Collateral Ratio:
          <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
        </div>
        <GradientDiagram
          colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
          currentPersentage={getCollateralRatioByPersentage(collateralRatio)}
        />
      </LoansValuesSectionInfo>
      <LoansValuesSectionInfo className="learn-more">
        <a href="https://mavryk.finance/litepaper#multi-collateral-vaults" target="_blank" rel="noreferrer">
          Learn more at the Mavryk Finance Docs
        </a>
      </LoansValuesSectionInfo>
    </LoansValuesSection>
  )
}
