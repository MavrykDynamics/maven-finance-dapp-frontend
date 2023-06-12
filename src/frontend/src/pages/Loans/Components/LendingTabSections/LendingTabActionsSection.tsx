import { useSelector } from 'react-redux'
import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'

import { State } from 'reducers'
import { LendingItemType } from 'utils/TypesAndInterfaces/Loans'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'

import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { LENDING_TAB_SLIDING_BUTTONS, assetDecimalsToShow, loansTabNames } from '../../Loans.const'
import { getLoansInputMaxAmount, isTezosAsset, loansInputValidation } from '../../Loans.helpers'
import { LENDING_TAB_SUPPLY_TEXT, LENDING_TAB_WITHDRAW_TEXT } from 'texts/banners/loan.text'
import { LENDING_APY } from 'texts/tooltips/loan.text'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from './../Modals/Modals.helpers'
import { INPUT_LARGE, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from '../../Loans.style'
import { LoansActionsSection } from './../LoansComponents.style'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { TokenAddress } from 'providers/TokensProvider/tokens.provider.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  loanTokenAddress: TokenAddress
  lendAPY: number
  marketAvailableLiquidity: number
  marketReserveAmount: number
}

export const LendingTabActionsSection = ({
  lendingItem,
  loanTokenAddress,
  lendAPY,
  marketAvailableLiquidity,
  marketReserveAmount,
}: LendingTabPropsType) => {
  const { openConfirmAddLendingAssetPopup, openConfirmRemoveLendingAssetPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { symbol, decimals, icon } = tokensMetadata[loanTokenAddress]
  const rate = tokensPrices[symbol]

  const {
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const { lendValue = 0, mBalance = 0 } = lendingItem || {}

  const [activeTab, setActiveTab] = useState(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.active))
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  // TODO: use just symbol, requires user tokens refactor
  const balanceSymbol = isTezosAsset(symbol.toLowerCase() ?? '') ? 'tezos' : symbol.toLowerCase() ?? ''

  const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

  const isSupplyActiveTab = activeTab?.id === loansTabNames.SUPPLY

  const futureMBalance = useMemo(
    () => (isSupplyActiveTab ? mBalance + Number(inputData.amount) : mBalance - Number(inputData.amount)),
    [inputData.amount, isSupplyActiveTab, mBalance],
  )

  const isDisabledButton = useMemo(() => {
    return inputData.validationStatus !== INPUT_STATUS_SUCCESS || isActionActive
  }, [inputData.validationStatus, isActionActive])

  const handleSwitchTab = (tabId: number) => {
    setInputData(DEFAULT_LOANS_INPUT_VALUE)
    setActiveTab(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.id === tabId))
  }

  const handleClickButton = () => {
    switch (activeTab?.id) {
      case loansTabNames.SUPPLY:
        openConfirmAddLendingAssetPopup({
          inputAmount: Number(inputData.amount),
          mBalance,
          lendingAPY: lendAPY,
          ...assetData,
        })

        break
      case loansTabNames.WITHDRAW:
        openConfirmRemoveLendingAssetPopup({
          inputAmount: Number(inputData.amount),
          mBalance,
          lendingAPY: lendAPY,
          currentLendedAmount: lendValue,
          availableLiquidity: marketAvailableLiquidity,
          reserveAmount: marketReserveAmount,
          ...assetData,
        })
        break
    }
  }

  const onChangeHandler = useCallback(
    (inputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount,
        maxAmount,
        options: {
          byDecimalPlaces: decimals || assetDecimalsToShow,
        },
      })

      setInputData({
        ...inputData,
        amount: inputAmount,
        validationStatus: validationStatus,
      })
    },
    [assetData, inputData],
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

  const useMaxHandler = useCallback(() => {
    isSupplyActiveTab
      ? onChangeHandler(getLoansInputMaxAmount(tokenBalance, decimals), tokenBalance)
      : onChangeHandler(
          getLoansInputMaxAmount(Math.min(mBalance, tokenBalance), decimals),
          Math.min(mBalance, tokenBalance),
        )
  }, [decimals, isSupplyActiveTab, tokenBalance, mBalance, onChangeHandler])

  const inputOnChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeHandler(e.target.value, isSupplyActiveTab ? tokenBalance : Math.min(mBalance, tokenBalance))
    },
    [isSupplyActiveTab, mBalance, onChangeHandler, tokenBalance],
  )

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onChange: inputOnChangeHandler,
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
    }),
    [inputData.amount, inputOnChangeHandler, inputOnBlurHandle, onFocusHandler],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: tokenBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler,
      inputStatus: inputData.validationStatus,
      inputSize: INPUT_LARGE,
      ...(rate ? { convertedValue: rate * Number(inputData.amount) } : {}),
    }),
    [assetData, inputData.amount, inputData.validationStatus, tokenBalance, useMaxHandler],
  )

  return (
    <LoansActionsSection className="lending-tab">
      <div className="switchers">
        <SlidingTabButtons onClick={handleSwitchTab} tabItems={LENDING_TAB_SLIDING_BUTTONS} className="vault" />
      </div>

      <div className="tab-text">{isSupplyActiveTab ? LENDING_TAB_SUPPLY_TEXT(symbol) : LENDING_TAB_WITHDRAW_TEXT}</div>

      <div>
        <div className="tab-text">Select Amount to {isSupplyActiveTab ? 'Supply' : 'Withdraw'}</div>

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

      <div className="mt-25">
        <div className="tab-text mb-10">Updated Lending {symbol} Stats</div>

        <div className="stats">
          <ThreeLevelListItem>
            <div className="name">
              Earn APY
              <CustomTooltip iconId="info" text={LENDING_APY(symbol)} />
            </div>
            <CommaNumber value={lendAPY} className="value" endingText="%" />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">{isSupplyActiveTab ? `m${symbol} Received` : 'Amount To Withdraw'}</div>
            <CommaNumber value={Number(inputData.amount)} className="value" />
          </ThreeLevelListItem>
          <ThreeLevelListItem className="right">
            <div className="name">New m{symbol} Balance</div>
            <CommaNumber value={futureMBalance} className="value" />
          </ThreeLevelListItem>
        </div>
      </div>

      <div className="button-wrapper">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={handleClickButton} disabled={isDisabledButton}>
          <Icon id="loans" />
          {isSupplyActiveTab ? 'Deposit' : 'Remove Asset'}
        </NewButton>
      </div>
    </LoansActionsSection>
  )
}
