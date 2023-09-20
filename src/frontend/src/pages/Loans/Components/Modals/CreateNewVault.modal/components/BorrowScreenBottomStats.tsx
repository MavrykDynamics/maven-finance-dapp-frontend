// compoennts
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// styles
import colors from 'styles/colors'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'

// consts
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { AVALIABLE_TO_BORROW, DAO_FEE, TOTAL_AMOUNT } from 'texts/tooltips/vault.text'

// utils
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type BorrowScreenBottomStatsProps = {
  inputAmount: number
  assetDecimalsToShow: number
  daoFee: number
  futureCollateralRatio: number
  futureBorrowCapacity: number
  headerText: string
}

export const BorrowScreenBottomStats = (props: BorrowScreenBottomStatsProps) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { headerText, inputAmount, assetDecimalsToShow, daoFee, futureCollateralRatio, futureBorrowCapacity } = props

  return (
    <div className="screen-bottom-stats">
      <div className="block-name">{headerText}</div>
      <VaultOverview>
        <div className="line">
          <ThreeLevelListItem>
            <div className="name">
              Total Amount
              <CustomTooltip
                iconId="info"
                defaultStrokeColor={colors[themeSelected].subHeadingText}
                text={TOTAL_AMOUNT}
                className="tooltip"
              />
            </div>
            <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">
              DAO Fee
              <CustomTooltip
                iconId="info"
                defaultStrokeColor={colors[themeSelected].subHeadingText}
                text={DAO_FEE}
                className="tooltip"
              />
            </div>
            <CommaNumber value={inputAmount * (daoFee / 100)} decimalsToShow={assetDecimalsToShow} className="value" />
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
            customColor={getCollateralRationPersent(colors[themeSelected], futureCollateralRatio)}
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
                defaultStrokeColor={colors[themeSelected].subHeadingText}
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
