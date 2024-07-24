// styles
import { LoansValuesSection, LoansValuesSectionInfo } from '../LoansComponents.style' // components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram' // consts & helpers
import { COLLATERAL_RATIO_GRADIENT, getCollateralRatioPercentColor } from 'pages/Loans/Loans.const'
import colors from 'styles/colors'
import { ACCRUED_INTEREST, APR, BORROW_CAPACITY, COLLATERAL_VALUE, OUTSTANDING_DEBT } from 'texts/tooltips/vault.text'
import { getCollateralRatioByPercentage } from 'pages/Loans/Loans.helpers' // providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type Props = {
  collateralRatio: number
  collateralBalance: number
  borrowedAmount: number
  borrowCapacity: number
  decimals: number
  accruedInterest: number
  apr: number
  rate: number
}

export const BorrowingExpandCardValuesSection = ({
  collateralRatio,
  collateralBalance,
  borrowedAmount,
  borrowCapacity,
  decimals,
  accruedInterest,
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
          <CommaNumber value={borrowedAmount + accruedInterest} className="value" showDecimal decimalsToShow={2} />

          <CommaNumber
            value={(borrowedAmount + accruedInterest) * rate}
            beginningText="$"
            className="rate"
            showDecimal
            decimalsToShow={2}
          />

          <div className="name">
            Outstanding Debt
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{OUTSTANDING_DEBT}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={borrowedAmount} decimalsToShow={2} className="value" />
          <CommaNumber value={borrowedAmount * rate} decimalsToShow={2} beginningText="$" className="rate" />
          <div className="name">Principal</div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={collateralBalance} className="value" beginningText="$" showDecimal decimalsToShow={2} />
          <div className="name margin-top">
            Collateral Value
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{COLLATERAL_VALUE}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo hasRate={Boolean(rate)}>
          <CommaNumber value={accruedInterest} decimalsToShow={2} className="value" />
          <CommaNumber value={accruedInterest * rate} decimalsToShow={2} beginningText="$" className="rate" />
          <div className="name">
            Accrued Interest
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{ACCRUED_INTEREST}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
          <div className="name margin-top">
            APR
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{APR}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>

        <LoansValuesSectionInfo>
          <CommaNumber value={borrowCapacity} className="value" beginningText="$" showDecimal decimalsToShow={2} />
          <div className="name margin-top">
            Borrow Capacity
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{BORROW_CAPACITY}</Tooltip.Content>
            </Tooltip>
          </div>
        </LoansValuesSectionInfo>
      </div>
      <LoansValuesSectionInfo
        className="collateral-diagram"
        customColor={getCollateralRatioPercentColor(colors[themeSelected], collateralRatio)}
      >
        <div className="percentage">
          Collateral Ratio:
          <CommaNumber
            value={collateralRatio}
            endingText="%"
            showDecimal
            decimalsToShow={2}
            beginningText={collateralRatio === 1000 ? '+' : ''}
          />
        </div>
        <GradientDiagram
          colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
          currentPercentage={getCollateralRatioByPercentage(collateralRatio)}
        />
      </LoansValuesSectionInfo>
      <LoansValuesSectionInfo className="learn-more">
        <a
          href="https://docs.mavenfinance.io/maven-finance/earn-and-borrow/multi-collateral-vaults"
          target="_blank"
          rel="noreferrer"
        >
          Learn more at the Maven Finance Docs
        </a>
      </LoansValuesSectionInfo>
    </LoansValuesSection>
  )
}
