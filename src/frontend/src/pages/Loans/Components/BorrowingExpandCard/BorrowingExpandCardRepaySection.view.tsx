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
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SlidingTabButtonType } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { AVALIABLE_TO_BORROW, FEES_DUE } from 'texts/tooltips/vault.text'
import { CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND, PARTIAL_LOAN_REPAYMENT } from 'texts/banners/vault.text'

// urils
import { getCollateralRatioByPercentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { checkNan } from 'utils/checkNan'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { operationRepay, useVaultFutureStats } from 'providers/VaultsProvider/hooks/useVaultFutureStats'

type Props = {
  vaultId: number
  vaultAddress: string
  borrowedToken: TokenMetadataType
  borrowedTokenRate: number
  accuredInterest: number
  borrowedAmount: number
  minimumRepay: number
  collateralBalance: number
  availableLiquidity: number
  activeRepayTab?: SlidingTabButtonType
  openConfirmRepayPopup: (inputAmount: number, callback: () => void) => void
  openConfirmRepayFullPopup: (callback: () => void) => void
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
    accuredInterest,
    borrowedToken,
    collateralBalance,
    borrowedTokenRate,
    availableLiquidity,
    minimumRepay,
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

  const totalOutstanding = accuredInterest + borrowedAmount
  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedToken.address })

  const isRepayInFull = activeRepayTab?.id === loansTabNames.REPAY_IN_FULL
  // TODO: calc warnings on validation, not here
  const isMinimumRepayWarning =
    inputData.validationStatus === INPUT_STATUS_ERROR &&
    inputAmount <= minimumRepay &&
    totalOutstanding !== 0 &&
    inputData.amount !== ''
  const isNotRepayInFullWarning = isRepayInFull && totalOutstanding !== inputAmount

  const { futureBorrowCapacity, futureCollateralRatio, futureTotalOustanding } = useVaultFutureStats({
    vaultCurrentTotalOutstanding: totalOutstanding,
    vaultCurrentCollateralBalance: collateralBalance,
    vaultTokenAddress: borrowedToken.address,
    marketAvailableLiquidity: availableLiquidity,
    operationType: operationRepay,
    inputValue: inputAmount,
  })

  const futureBorrowedAmount = borrowedAmount - inputAmount < 0 ? 0 : borrowedAmount - inputAmount

  const clearData = () => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
        minAmount: minimumRepay,
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
    [decimals, inputData, minimumRepay],
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
        ? openConfirmRepayFullPopup(clearData)
        : openConfirmRepayPopup(inputAmount, clearData)
    }
  }

  useEffect(() => {
    if (isRepayInFull) {
      const userMaxRepaymentAmount = Math.min(userAssetBalance, totalOutstanding)
      const validationStatus =
        totalOutstanding !== 0
          ? loansInputValidation({
              inputAmount: String(userMaxRepaymentAmount),
              maxAmount: userMaxRepaymentAmount,
              minAmount: minimumRepay,
              options: {
                byDecimalPlaces: decimals || assetDecimalsToShow,
              },
            })
          : ''

      setInputData({
        amount: String(userMaxRepaymentAmount),
        validationStatus,
      })
    } else {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
    }
  }, [activeRepayTab, decimals, isRepayInFull, minimumRepay, totalOutstanding, userAssetBalance, setInputData])

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        inputOnChangeHandle(e.target.value, Math.min(userAssetBalance, totalOutstanding)),
    }),
    [inputData.amount, inputOnBlurHandle, inputOnChangeHandle, onFocusHandler, totalOutstanding, userAssetBalance],
  )

  const settings: InputSettings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () =>
        inputOnChangeHandle(
          getLoansInputMaxAmount(Math.min(userAssetBalance, totalOutstanding), decimals),
          Math.min(userAssetBalance, totalOutstanding),
        ),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * borrowedTokenRate,
      inputSize: INPUT_LARGE,
      validationFns: [[validateInputLength, ERR_MSG_INPUT]],
    }),
    [
      symbol,
      inputData.validationStatus,
      inputAmount,
      borrowedTokenRate,
      inputOnChangeHandle,
      userAssetBalance,
      totalOutstanding,
      decimals,
    ],
  )

  return (
    <>
      {isRepayInFull && <div className="coming-soon">Coming Soon</div>}

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
        <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE}`}>
          <Icon id="error-triangle" />
          {CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND}
        </StatusMessageStyled>
      ) : null}

      {isNotRepayInFullWarning ? (
        <StatusMessageStyled className="repay-in-full">
          <Icon id="info" />
          {PARTIAL_LOAN_REPAYMENT}
        </StatusMessageStyled>
      ) : null}

      <div className={!isMinimumRepayWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Repay {symbol} Stats</div>

        <RepayTableStats
          futureBorrowedAmount={futureBorrowedAmount}
          collateralBalance={collateralBalance}
          futureTotalOutstanding={futureTotalOustanding}
          futureCollateralRatio={futureCollateralRatio}
          futureBorrowCapacity={futureBorrowCapacity}
          accuredInterest={accuredInterest}
        />
      </div>

      <div className="button-wrapper">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={handleClickRepay}
          disabled={
            inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive || isRepayInFull
          }
        >
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
  accuredInterest,
}: {
  futureBorrowedAmount: number
  collateralBalance: number
  futureTotalOutstanding: number
  futureCollateralRatio: number
  futureBorrowCapacity: number
  accuredInterest: number
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
              <Tooltip.Content>{FEES_DUE(accuredInterest)}</Tooltip.Content>
            </Tooltip>
          </div>
          <CommaNumber value={Math.ceil(accuredInterest)} decimalsToShow={0} className="value" />
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
