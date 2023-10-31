import { useMemo } from 'react'
import classNames from 'classnames'

// consts
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { BUTTON_PRIMARY, BUTTON_PULSE, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { AVALIABLE_TO_BORROW, DAO_FEE, TOTAL_AMOUNT } from 'texts/tooltips/vault.text'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { ERR_MSG_INPUT, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import {
  COLLATERAL_AWARE_BORROWING_ADJUST_YOUR_AMOUNT,
  SELECT_THE_AMOUNT_YOU_WOULD_LIKE_TO_BORROW,
} from 'texts/banners/vault.text'
import { MINIMUN_COLLATERAL_RATIO_PERSENT } from 'providers/VaultsProvider/helpers/vaults.const'
import colors from 'styles/colors'

// hooks
import { operationBorrow, useVaultFutureStats } from 'providers/VaultsProvider/hooks/useVaultFutureStats'
import { useBorrowInputData } from '../Modals/hooks/Market/useBorrowInputData'

// utils
import { checkNan } from 'utils/checkNan'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { Settings } from 'app/App.components/Input/newInput.type'

// styles & components
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { VaultOverview, StatusMessageStyled, CardSectionWrapper } from '../LoansComponents.style'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

type Props = {
  borrowedAssetAddress: TokenAddressType
  borrowCapacity: number
  borrowAPR: number
  availableLiquidity: number
  totalOutstanding: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  DAOFee: number
  openConfirmBorrowPopup: (inputAmount: number, callback: () => void) => void
}

export const BorrowingExpandCardBorrowSection = (props: Props) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const {
    borrowedAssetAddress,
    borrowCapacity,
    availableLiquidity,
    totalOutstanding,
    currentCollateralBalance,
    DAOFee,
    openConfirmBorrowPopup,
  } = props

  const { inputData, settings, inputProps, rate, icon, symbol, clearData } = useBorrowInputData(
    borrowedAssetAddress,
    borrowCapacity
  )

  const inputAmount = checkNan(parseFloat(inputData.amount))

  const { futureBorrowCapacity, futureCollateralRatio } = useVaultFutureStats({
    operationType: operationBorrow,
    inputValue: inputAmount,
    marketAvailableLiquidity: availableLiquidity,
    vaultCurrentTotalOutstanding: totalOutstanding,
    vaultCurrentCollateralBalance: currentCollateralBalance,
    vaultTokenAddress: borrowedAssetAddress,
  })

  const isDisabledButton = inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive

  const showWarning =
    (inputAmount > borrowCapacity / rate || futureCollateralRatio < MINIMUN_COLLATERAL_RATIO_PERSENT) &&
    inputAmount !== 0

  const newSettings: Settings = useMemo(
    () => ({
      ...settings,
      validationFns: [[validateInputLength, ERR_MSG_INPUT]],
    }),
    [settings]
  )

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
          settings={newSettings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>

      {showWarning ? (
        <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE}`}>
          <Icon id="error-triangle" />
          {futureCollateralRatio < MINIMUN_COLLATERAL_RATIO_PERSENT
            ? COLLATERAL_AWARE_BORROWING_ADJUST_YOUR_AMOUNT
            : SELECT_THE_AMOUNT_YOU_WOULD_LIKE_TO_BORROW}
        </StatusMessageStyled>
      ) : null}

      <div className={!showWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Borrow {symbol} Stats</div>
        <CardSectionWrapper>
          <TableStats
            futureCollateralRatio={futureCollateralRatio}
            inputAmount={inputAmount}
            currentCollateralBalance={currentCollateralBalance}
            futureBorrowCapacity={futureBorrowCapacity}
            DAOFee={DAOFee}
          />
        </CardSectionWrapper>
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

const TableStats = ({
  futureCollateralRatio,
  inputAmount,
  currentCollateralBalance,
  futureBorrowCapacity,
  DAOFee,
}: {
  futureCollateralRatio: number
  inputAmount: number
  currentCollateralBalance: number
  futureBorrowCapacity: number
  DAOFee: number
}) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  return (
    <VaultOverview>
      <div className="line">
        <ThreeLevelListItem>
          <div className="name">
            Total Amount
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{TOTAL_AMOUNT}</Tooltip.Content>
            </Tooltip>
          </div>
          <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">
            DAO Fee
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{DAO_FEE}</Tooltip.Content>
            </Tooltip>
          </div>
          <CommaNumber value={inputAmount * (DAOFee / 100)} decimalsToShow={assetDecimalsToShow} className="value" />
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
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{AVALIABLE_TO_BORROW}</Tooltip.Content>
            </Tooltip>
          </div>
          <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
        </ThreeLevelListItem>
      </div>
    </VaultOverview>
  )
}
