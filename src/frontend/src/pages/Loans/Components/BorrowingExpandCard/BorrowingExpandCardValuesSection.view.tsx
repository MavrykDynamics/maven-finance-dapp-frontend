import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import {
  BorrowingTabListItemValuesSectionStyled,
  BorrowingTabListItemValuesSectionInfo,
} from '../LoansComponents.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import colors from 'styles/colors'

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
  const { themeSelected } = useSelector((state: State) => state.preferences)

  return (
    <BorrowingTabListItemValuesSectionStyled>
      <BorrowingTabListItemValuesSectionInfo hasRate={Boolean(rate)}>
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
          <CustomTooltip iconId="info" text="something" defaultStrokeColor={colors[themeSelected].textColor} />
        </div>
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo hasRate={Boolean(rate)}>
        <CommaNumber value={borrowedAmount} decimalsToShow={decimals} className="value" />
        <CommaNumber value={borrowedAmount * rate} decimalsToShow={2} beginningText="$" className="rate" />
        <div className="name">Principal</div>
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo hasRate={Boolean(rate)}>
        <CommaNumber value={collateralBalance} className="value" beginningText="$" showDecimal decimalsToShow={2} />
        <div className="name margin-top">
          Collateral value
          <CustomTooltip iconId="info" text="something" defaultStrokeColor={colors[themeSelected].textColor} />
        </div>
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo hasRate={Boolean(rate)}>
        <CommaNumber value={fee} decimalsToShow={decimals} className="value" />
        <CommaNumber value={fee * rate} decimalsToShow={2} beginningText="$" className="rate" />
        <div className="name">
          Accrued Interest
          <CustomTooltip
            iconId="info"
            text="Interest, compounded over time every time you borrow"
            defaultStrokeColor={colors[themeSelected].textColor}
          />
        </div>
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo hasRate={Boolean(rate)}>
        <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
        <div className="name margin-top">
          APR
          <CustomTooltip iconId="info" text="something" defaultStrokeColor={colors[themeSelected].textColor} />
        </div>
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo hasRate={Boolean(rate)}>
        <CommaNumber value={borrowCapacity} className="value" beginningText="$" showDecimal decimalsToShow={2} />
        <div className="name margin-top">
          Borrow Capacity
          <CustomTooltip iconId="info" text="something" defaultStrokeColor={colors[themeSelected].textColor} />
        </div>
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo
        className="collateral-diagram"
        customColor={getCollateralRationPersent(collateralRatio)}
      >
        <div className="percentage">
          Collateral Ratio:
          <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
        </div>
        <GradientDiagram
          colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
          currentPersentage={Math.max(0, Math.min(((collateralRatio - 100) / 150) * 100, 100))}
        />
      </BorrowingTabListItemValuesSectionInfo>

      <BorrowingTabListItemValuesSectionInfo className="learn-more">
        <a href="https://mavryk.finance/litepaper#multi-collateral-vaults" target="_blank" rel="noreferrer">
          Learn more at the Mavryk Docs
        </a>
      </BorrowingTabListItemValuesSectionInfo>
    </BorrowingTabListItemValuesSectionStyled>
  )
}
