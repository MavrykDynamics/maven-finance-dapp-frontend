import { useMemo } from 'react'
import classNames from 'classnames'
import { VaultOverview, StatusMessageStyled } from '../LoansComponents.style'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { silverColor } from 'styles'
import { BUTTON_PRIMARY, BUTTON_PULSE, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import {
  COLLATERAL_AWARE_BORROWING_ADJUST_YOUR_AMOUNT,
  SELECT_THE_AMOUNT_YOU_WOULD_LIKE_TO_BORROW,
} from 'texts/banners/vault.text'
import { AVALIABLE_TO_BORROW, DAO_FEE, TOTAL_AMOUNT } from 'texts/tooltips/vault.text'
import { checkNan } from 'utils/checkNan'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useBorrowInputData } from '../Modals/CreateNewVault.modal/components/useBorrowInputData'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type Props = {
  borrowedAssetAddress: TokenAddressType
  borrowCapacity: number
  borrowAPR: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  DAOFee: number
  currentBorrowedAmount: number
  openConfirmBorrowPopup: (inputAmount: number, callback: () => void) => void
}

export const BorrowingExpandCardBorrowSection = (props: Props) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const {
    borrowedAssetAddress,
    borrowCapacity = 0,
    currentBorrowedAmount = 0,
    currentCollateralBalance = 0,
    DAOFee = 0,
    openConfirmBorrowPopup,
  } = props

  const { inputData, settings, inputProps, rate, icon, symbol, clearData } = useBorrowInputData(
    borrowedAssetAddress,
    borrowCapacity,
  )

  const inputAmount = checkNan(parseFloat(inputData.amount))
  const isDisabledButton = inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  const showWarning = (inputAmount > borrowCapacity / rate || futureCollateralRatio < 200) && inputAmount !== 0

  return (
    <>
      <div className="tab-text">
        Input an amount you would borrow. You are only able to borrow up to a 50% value of your collateral.
      </div>

      <div>
        <div className="tab-text">Select Amount to Borrow</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': rate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>

      {showWarning ? (
        <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE}`}>
          <Icon id="error-triangle" />
          {futureCollateralRatio < 200
            ? COLLATERAL_AWARE_BORROWING_ADJUST_YOUR_AMOUNT
            : SELECT_THE_AMOUNT_YOU_WOULD_LIKE_TO_BORROW}
        </StatusMessageStyled>
      ) : null}

      <div className={!showWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Borrow {symbol} Stats</div>
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
                value={inputAmount * (DAOFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount Received</div>
              <CommaNumber
                value={inputAmount - inputAmount * (DAOFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>

            <ThreeLevelListItem className="right">
              <div className="name">Collateral Value</div>
              <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
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

      <div className="button-wrapper">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={() => openConfirmBorrowPopup(inputAmount, clearData)}
          disabled={isDisabledButton}
          animation={isDisabledButton ? null : BUTTON_PULSE}
        >
          <Icon id="coin-loan" />
          Borrow
        </NewButton>
      </div>
    </>
  )
}
