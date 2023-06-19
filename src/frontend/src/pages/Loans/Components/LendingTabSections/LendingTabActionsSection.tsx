import { useSelector } from 'react-redux'
import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'

import { State } from 'reducers'
import { LendingItemType } from 'utils/TypesAndInterfaces/Loans'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'

import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { LENDING_TAB_SLIDING_BUTTONS, assetDecimalsToShow, loansTabNames } from '../../Loans.const'
import { getLoansInputMaxAmount, loansInputValidation } from '../../Loans.helpers'
import { LENDING_TAB_SUPPLY_TEXT, LENDING_TAB_WITHDRAW_TEXT } from 'texts/banners/loan.text'
import { LENDING_APY } from 'texts/tooltips/loan.text'
import { DEFAULT_LOANS_INPUT_VALUE } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import {
  INPUT_LARGE,
  INPUT_STATUS_SUCCESS,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'

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
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  loanTokenAddress: TokenAddressType
  lendAPY: number
}

export const LendingTabActionsSection = ({ lendingItem, loanTokenAddress, lendAPY }: LendingTabPropsType) => {
  const { openConfirmAddLendingAssetPopup, openConfirmRemoveLendingAssetPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  const loanToken = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensMetadata, tokensPrices })

  const {} = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const { lendValue = 0, mBalance = 0 } = lendingItem || {}

  const [activeTab, setActiveTab] = useState(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.active))
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const isSupplyActiveTab = activeTab?.id === loansTabNames.SUPPLY

  if (!loanToken || !loanToken.rate) return null

  const { symbol, decimals, icon, rate } = loanToken
  const tokenBalance = getUserBalanceByAddress({ userTokensBalances, tokenAddress: loanToken.address })

  const convertedMbalance = convertNumberForClient({ number: mBalance, grade: decimals })
  const convertedLendValue = convertNumberForClient({ number: lendValue, grade: decimals })

  const futureMBalance = isSupplyActiveTab
    ? convertedMbalance + Number(inputData.amount)
    : convertedMbalance - Number(inputData.amount)

  const isDisabledButton = inputData.validationStatus !== INPUT_STATUS_SUCCESS || isActionActive

  const handleSwitchTab = (tabId: number) => {
    setInputData(DEFAULT_LOANS_INPUT_VALUE)
    setActiveTab(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.id === tabId))
  }

  const handleClickButton = () => {
    switch (activeTab?.id) {
      case loansTabNames.SUPPLY:
        openConfirmAddLendingAssetPopup({
          inputAmount: Number(inputData.amount),
          mBalance: convertedMbalance,
          lendingAPY: lendAPY,
          tokenAddress: loanTokenAddress,
        })

        break
      case loansTabNames.WITHDRAW:
        openConfirmRemoveLendingAssetPopup({
          inputAmount: Number(inputData.amount),
          currentLendedAmount: convertedLendValue,
          tokenAddress: loanTokenAddress,
        })
        break
    }
  }

  const onChangeHandler = (inputAmount: string, maxAmount: number) => {
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
  }

  const inputOnBlurHandle = () =>
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })

  const onFocusHandler = () =>
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })

  const useMaxHandler = () =>
    isSupplyActiveTab
      ? onChangeHandler(getLoansInputMaxAmount(tokenBalance, decimals), tokenBalance)
      : onChangeHandler(
          getLoansInputMaxAmount(Math.min(mBalance, tokenBalance), decimals),
          Math.min(mBalance, tokenBalance),
        )

  const inputOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeHandler(e.target.value, isSupplyActiveTab ? tokenBalance : Math.min(mBalance, tokenBalance))
  }

  const inputProps: InputProps = {
    value: inputData.amount,
    type: 'number',
    onChange: inputOnChangeHandler,
    onBlur: inputOnBlurHandle,
    onFocus: onFocusHandler,
  }

  const settings: Settings = {
    balance: tokenBalance,
    balanceAsset: symbol,
    balanceName: 'Wallet Balance',
    useMaxHandler,
    inputStatus: inputData.validationStatus,
    inputSize: INPUT_LARGE,
    ...(rate ? { convertedValue: rate * Number(inputData.amount) } : {}),
  }

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
