import { useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

// components
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// types
import { InputProps, InputSettings } from 'app/App.components/Input/newInput.type'
import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

// styles
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { StatusMessageStyled, VaultOverview } from '../LoansComponents.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'

// consts
import colors from 'styles/colors'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import {
  assetDecimalsToShow,
  COLLATERAL_RATIO_GRADIENT,
  getCollateralRatioPercentColor,
  loansTabNames,
} from 'pages/Loans/Loans.const'
import {
  ERR_MSG_INPUT,
  getOnBlurValue,
  getOnFocusValue,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SlidingTabButtonType } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { AVALIABLE_TO_BORROW, FEES_DUE } from 'texts/tooltips/vault.text'
import {
  CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND,
  OVER_REPAYING_ROUNDED_WARNING_TEXT,
  OVER_REPAYING_WARNING_TEXT,
  PARTIAL_LOAN_REPAYMENT,
} from 'texts/banners/vault.text'

// urils
import { getCollateralRatioByPercentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { checkNan } from 'utils/checkNan'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { operationRepay, useVaultFutureStats } from 'providers/VaultsProvider/hooks/useVaultFutureStats'
import { STATUS_FLAG_INFO } from 'app/App.components/StatusFlag/StatusFlag.constants'

type Props = {
  vaultId: number
  vaultAddress: string
  borrowedToken: TokenMetadataType
  borrowedTokenRate: number
  accruedInterest: number
  totalOutstanding: number
  borrowedAmount: number
  minimumRepay: number
  collateralBalance: number
  availableLiquidity: number
  activeRepayTab?: SlidingTabButtonType
  openConfirmRepayPopup: (repayAmount: number, callback: () => void) => void
  openConfirmRepayFullPopup: (repayAmount: number, callback: () => void) => void
}

type InputDataType = {
  amount: string
  validationStatus: InputStatusType
}

export const BorrowingExpandCardRepaySection = (props: Props) => {
  const { userTokensBalances } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const {
    vaultId,
    vaultAddress,
    accruedInterest,
    borrowedToken,
    collateralBalance,
    borrowedTokenRate,
    availableLiquidity,
    minimumRepay,
    totalOutstanding,
    borrowedAmount,
    activeRepayTab,
    openConfirmRepayPopup,
    openConfirmRepayFullPopup,
  } = props

  const { decimals, symbol, icon } = borrowedToken

  const [inputData, setInputData] = useState<InputDataType>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })

  const inputAmount = checkNan(parseFloat(inputData.amount))
  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedToken.address })
  const isRepayInFull = activeRepayTab?.id === loansTabNames.REPAY_IN_FULL
  const isBtnDisabled =
    isActionActive || inputData.validationStatus !== INPUT_STATUS_SUCCESS || (inputAmount === 0 && !isRepayInFull)

  /**
   * max repay total outstanding is added 1 token if it's pure integer or rounded to next integer,
   * so user will repay more that total oustanding, and difference will be returned back to his wallet
   *
   * if totalOutstanding is 0, we do not round it, otherwise round
   */
  const roundedTotalOutstanding =
    totalOutstanding === 0
      ? 0
      : Math.floor(totalOutstanding) - totalOutstanding === 0
      ? totalOutstanding + 1
      : Math.ceil(totalOutstanding)

  const inputUseMaxAmount = Math.min(userAssetBalance, roundedTotalOutstanding)

  /**
   * condition for minimum repay warning,
   * when user enters in input less amount of tokens than minimum available repayment amount
   */
  const isMinimumRepayWarning =
    !isRepayInFull &&
    inputData.validationStatus !== INPUT_STATUS_DEFAULT &&
    inputAmount <= minimumRepay &&
    inputAmount > 0

  /**
   * condition for not repaying in full amount,
   * when user repaying in full and input amount is less than vault's total outstanding
   */
  const isNotRepayInFullWarning =
    isRepayInFull &&
    inputData.validationStatus !== INPUT_STATUS_DEFAULT &&
    roundedTotalOutstanding > inputAmount &&
    inputAmount > 0

  /**
   * condition for overRepaing warning,
   * when input amount is greater than vault's rounded total outstanding
   */
  const isOverRepayingWarning = inputAmount > 0 && inputAmount >= roundedTotalOutstanding

  /**
   * useEffect to set initial input value on tab change and on first visit
   */
  useEffect(() => {
    if (isRepayInFull) {
      const validationStatus = loansInputValidation({
        inputAmount: String(roundedTotalOutstanding),
        maxAmount: userAssetBalance,
        minAmount: roundedTotalOutstanding,
        options: {
          byDecimalPlaces: Math.min(decimals || assetDecimalsToShow, assetDecimalsToShow),
        },
      })

      setInputData({
        amount: String(roundedTotalOutstanding),
        validationStatus: validationStatus,
      })
    }

    if (!isRepayInFull) {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
    }
  }, [isRepayInFull])

  const { futureBorrowCapacity, futureCollateralRatio, futureTotalOustanding } = useVaultFutureStats({
    vaultCurrentTotalOutstanding: totalOutstanding,
    vaultCurrentCollateralBalance: collateralBalance,
    vaultTokenAddress: borrowedToken.address,
    marketAvailableLiquidity: availableLiquidity,
    operationType: operationRepay,
    inputValue: inputAmount,
  })

  const futureBorrowedAmount = borrowedAmount - inputAmount

  const clearData = () => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number, minAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
        minAmount,
        options: {
          byDecimalPlaces: decimals || assetDecimalsToShow,
        },
      })

      setInputData({
        ...inputData,
        amount: newInputAmount,
        validationStatus: validationStatus,
      })
    },
    [decimals, inputData],
  )

  const inputOnBlurHandle = useCallback(() => {
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })
  }, [inputData])

  const onFocusHandler = useCallback(() => {
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })
  }, [inputData])

  const handleClickRepay = async () => {
    if (vaultId && vaultAddress) {
      isRepayInFull && !isNotRepayInFullWarning
        ? openConfirmRepayFullPopup(inputAmount, clearData)
        : openConfirmRepayPopup(inputAmount, clearData)
    }
  }

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        inputOnChangeHandle(e.target.value, userAssetBalance, isRepayInFull ? roundedTotalOutstanding : minimumRepay)
      },
    }),
    [
      inputData.amount,
      inputOnBlurHandle,
      inputOnChangeHandle,
      isRepayInFull,
      minimumRepay,
      onFocusHandler,
      roundedTotalOutstanding,
      userAssetBalance,
    ],
  )

  const settings: InputSettings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () => {
        inputOnChangeHandle(
          getLoansInputMaxAmount(inputUseMaxAmount, decimals),
          userAssetBalance,
          isRepayInFull ? roundedTotalOutstanding : minimumRepay,
        )
      },
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * borrowedTokenRate,
      inputSize: INPUT_LARGE,
      validationFns: [[validateInputLength, ERR_MSG_INPUT]],
    }),
    [
      userAssetBalance,
      symbol,
      inputData.validationStatus,
      inputAmount,
      borrowedTokenRate,
      inputOnChangeHandle,
      inputUseMaxAmount,
      decimals,
      isRepayInFull,
      roundedTotalOutstanding,
      minimumRepay,
    ],
  )

  return (
    <>
      <div>
        <div className="tab-text">Select Amount to Repay</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': borrowedTokenRate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} useRounded /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>

      {isMinimumRepayWarning ? (
        <StatusMessageStyled className={vaultsStatuses.LIQUIDATABLE}>
          <Icon id="error-triangle" />
          {CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND}
        </StatusMessageStyled>
      ) : null}

      {isNotRepayInFullWarning ? (
        <StatusMessageStyled className={vaultsStatuses.LIQUIDATABLE}>
          <Icon id="error-triangle" />
          {PARTIAL_LOAN_REPAYMENT}
        </StatusMessageStyled>
      ) : null}

      {isOverRepayingWarning ? (
        <StatusMessageStyled className={STATUS_FLAG_INFO}>
          <Icon id="info" />
          {inputAmount === roundedTotalOutstanding ? OVER_REPAYING_ROUNDED_WARNING_TEXT : OVER_REPAYING_WARNING_TEXT}
        </StatusMessageStyled>
      ) : null}

      <div className={!isMinimumRepayWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Repay {symbol} Stats</div>

        <RepayTableStats
          futureBorrowedAmount={Math.max(futureBorrowedAmount, 0)}
          collateralBalance={collateralBalance}
          futureTotalOutstanding={Math.max(futureTotalOustanding, 0)}
          futureCollateralRatio={futureCollateralRatio}
          futureBorrowCapacity={futureBorrowCapacity}
          accruedInterest={accruedInterest}
        />
      </div>

      <div className="button-wrapper">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={handleClickRepay} disabled={isBtnDisabled}>
          <Icon id="okIcon" />
          Repay in {isRepayInFull ? 'Full' : 'Part'}
        </NewButton>
      </div>
    </>
  )
}

const RepayTableStats = ({
  futureBorrowedAmount,
  collateralBalance,
  futureTotalOutstanding,
  futureCollateralRatio,
  futureBorrowCapacity,
  accruedInterest,
}: {
  futureBorrowedAmount: number
  collateralBalance: number
  futureTotalOutstanding: number
  futureCollateralRatio: number
  futureBorrowCapacity: number
  accruedInterest: number
}) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  return (
    <VaultOverview>
      <div className="line">
        <ThreeLevelListItem>
          <div className="name">Borrowed</div>
          <CommaNumber value={futureBorrowedAmount} className="value" />
        </ThreeLevelListItem>

        <ThreeLevelListItem>
          <div className="name">
            Fees Due
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{FEES_DUE(accruedInterest)}</Tooltip.Content>
            </Tooltip>
          </div>
          <CommaNumber value={Math.ceil(accruedInterest)} decimalsToShow={0} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Total Outstanding</div>
          <CommaNumber value={futureTotalOutstanding} className="value" showDecimal decimalsToShow={2} />
        </ThreeLevelListItem>
        <ThreeLevelListItem className="right">
          <div className="name">Collateral Value</div>
          <CommaNumber value={collateralBalance} className="value" beginningText="$" />
        </ThreeLevelListItem>
      </div>

      <div className="line">
        <ThreeLevelListItem
          className="collateral-diagram"
          $customColor={getCollateralRatioPercentColor(colors[themeSelected], futureCollateralRatio)}
        >
          <div className={`percentage`}>
            Collateral Ratio:
            <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
          </div>
          <GradientDiagram
            className="diagram"
            colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
            currentPercentage={getCollateralRatioByPercentage(futureCollateralRatio)}
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
