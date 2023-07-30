import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import React from 'react'
import { silverColor } from 'styles'
import { AVALIABLE_TO_BORROW, DAO_FEE, TOTAL_AMOUNT } from 'texts/tooltips/vault.text'

type BorrowScreenBottomStatsProps = {
  inputAmount: number
  assetDecimalsToShow: number
  daoFee: number
  futureCollateralRatio: number
  futureBorrowCapacity: number
  headerText: string
}

export const BorrowScreenBottomStats = (props: BorrowScreenBottomStatsProps) => {
  const { headerText, inputAmount, assetDecimalsToShow, daoFee, futureCollateralRatio, futureBorrowCapacity } = props

  return (
    <div className="screen-bottom-stats">
      <div className="block-name">{headerText}</div>
      <VaultOverview>
        <div className="line">
          <ThreeLevelListItem>
            <div className="name">
              Total Amount
              <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text={TOTAL_AMOUNT} className="tooltip" />
            </div>
            <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">
              DAO Fee
              <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text={DAO_FEE} className="tooltip" />
            </div>
            <CommaNumber
              value={inputAmount * (daoFee / 100)}
              decimalsToShow={assetDecimalsToShow}
              className="value"
              endingText="%"
            />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Amount Received</div>
            <CommaNumber
              value={inputAmount - inputAmount * (daoFee / 100)}
              decimalsToShow={assetDecimalsToShow}
              className="value"
            />
          </ThreeLevelListItem>
        </div>

        <div className="line">
          <ThreeLevelListItem
            className="collateral-diagram right"
            customColor={getCollateralRationPersent(futureCollateralRatio)}
          >
            <div className={`percentage`}>
              Collateral Ratio:
              <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
            </div>
            <GradientDiagram
              className="diagram"
              colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
              currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
            />
          </ThreeLevelListItem>

          <ThreeLevelListItem className="right">
            <div className="name">
              Available To Borrow
              <CustomTooltip
                iconId="info"
                defaultStrokeColor={silverColor}
                text={AVALIABLE_TO_BORROW}
                className="tooltip"
              />
            </div>
            <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
          </ThreeLevelListItem>
        </div>
      </VaultOverview>
    </div>
  )
}
