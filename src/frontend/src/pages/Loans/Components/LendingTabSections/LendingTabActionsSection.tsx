import { useEffect, useState } from 'react'
import classNames from 'classnames'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useCollateralInputData } from '../Modals/hooks/Market/useCollateralInputData'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'

// types
import { LendingItemType } from 'providers/LoansProvider/loans.provider.types'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'

// utils
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { validateInputLength } from 'app/App.utils/input/validateInput'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { LENDING_TAB_SLIDING_BUTTONS, loansTabNames } from '../../Loans.const'
import {
  LENDING_TAB_SUPPLY_TEXT,
  LENDING_TAB_WITHDRAW_ERROR_TEXT,
  LENDING_TAB_WITHDRAW_TEXT,
} from 'texts/banners/loan.text'
import { INFO_ERROR } from 'app/App.components/Info/info.constants'
import { EARN_APY } from 'texts/tooltips/loan.text'
import {
  ERR_MSG_INPUT,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'

// view
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from '../../Loans.style'
import { CardSectionWrapper, LoansActionsSection } from './../LoansComponents.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { XTZLimitInfoBanner } from '../Modals/components/XTZLimitInfoBanner'
import { Info } from 'app/App.components/Info/Info.view'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  loanTokenAddress: TokenAddressType
  lendAPY: number
  marketReserveAmount: number
}

export const LendingTabActionsSection = ({
  lendingItem,
  loanTokenAddress,
  lendAPY,
  marketReserveAmount,
}: LendingTabPropsType) => {
  const { openConfirmAddLendingAssetPopup, openConfirmRemoveLendingAssetPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userTokensBalances } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const loanToken = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensMetadata, tokensPrices })

  const { lendValue = 0 } = lendingItem || {}

  const [activeTab, setActiveTab] = useState(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.active))
  const isSupplyActiveTab = activeTab?.id === loansTabNames.SUPPLY

  const {
    inputData,
    setInputData,
    setSelectedCollateral,
    inputOnBlurHandle,
    inputOnChangeHandle: onChangeHandler,
    willExceedXTZTheLimit,
    onFocusHandler,
    useMaxHandler: maxHandlerFromHook,
    clearData,
  } = useCollateralInputData(!isSupplyActiveTab)

  useEffect(() => {
    setSelectedCollateral(loanTokenAddress)
  }, [setSelectedCollateral, loanTokenAddress])

  if (!loanToken || !loanToken.rate) return null

  const { symbol, icon, rate } = loanToken
  const tokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: loanToken.address })

  const futureMBalance = isSupplyActiveTab ? lendValue + Number(inputData.amount) : lendValue - Number(inputData.amount)

  const isDisabledButton = inputData.validationStatus !== INPUT_STATUS_SUCCESS || isActionActive

  const handleSwitchTab = (tabId: number) => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
    setActiveTab(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.id === tabId))
  }

  const handleClickButton = () => {
    switch (activeTab?.id) {
      case loansTabNames.SUPPLY:
        openConfirmAddLendingAssetPopup({
          callback: clearData,
          inputAmount: Number(inputData.amount),
          mBalance: lendValue,
          lendingAPY: lendAPY,
          tokenAddress: loanTokenAddress,
        })

        break
      case loansTabNames.WITHDRAW:
        openConfirmRemoveLendingAssetPopup({
          callback: clearData,
          inputAmount: Number(inputData.amount),
          currentLendedAmount: lendValue,
          tokenAddress: loanTokenAddress,
        })
        break
    }
  }

  const useMaxHandler = () => {
    const inputMaxAmount = Math.min(lendValue, marketReserveAmount)

    isSupplyActiveTab ? maxHandlerFromHook(tokenBalance) : maxHandlerFromHook(inputMaxAmount)
  }

  const inputOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeHandler(e.target.value, isSupplyActiveTab ? tokenBalance : Math.min(lendValue, marketReserveAmount))
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
    validationFns: [[validateInputLength, ERR_MSG_INPUT]],
    ...(rate ? { convertedValue: rate * Number(inputData.amount) } : {}),
  }

  const showWarning = !isSupplyActiveTab && inputData.validationStatus === INPUT_STATUS_ERROR

  return (
    <LoansActionsSection className="lending-tab">
      <div className="switchers">
        <SlidingTabButtons onClick={handleSwitchTab} tabItems={LENDING_TAB_SLIDING_BUTTONS} className="vault" />
      </div>

      <div className="tab-text center">
        {isSupplyActiveTab ? LENDING_TAB_SUPPLY_TEXT(symbol) : LENDING_TAB_WITHDRAW_TEXT}
      </div>

      <div>
        <div className="tab-text">Select Amount to {isSupplyActiveTab ? 'Supply' : 'Withdraw'}</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': rate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug useRounded imageLink={icon} alt={`${symbol} icon`} /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>

      {showWarning ? (
        <div className="mt-20">
          <Info text={LENDING_TAB_WITHDRAW_ERROR_TEXT} type={INFO_ERROR} />{' '}
        </div>
      ) : null}

      <XTZLimitInfoBanner show={willExceedXTZTheLimit} spaces={!showWarning ? 'mt-20' : ''} />

      <div className={!showWarning && !willExceedXTZTheLimit ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Lending {symbol} Stats</div>

        <CardSectionWrapper>
          <LendingStatsTable
            lendAPY={lendAPY}
            isSupplyActiveTab={isSupplyActiveTab}
            symbol={symbol}
            amount={inputData.amount}
            futureMBalance={futureMBalance}
          />
        </CardSectionWrapper>
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

const LendingStatsTable = ({
  lendAPY,
  isSupplyActiveTab,
  futureMBalance,
  symbol,
  amount,
}: {
  lendAPY: number
  isSupplyActiveTab: boolean
  symbol: string
  amount: number | string
  futureMBalance: number
}) => {
  return (
    <div className="stats">
      <ThreeLevelListItem>
        <div className="name">
          Earn APY
          <Tooltip>
            <Tooltip.Trigger className="ml-5">
              <Icon id="info" />
            </Tooltip.Trigger>
            <Tooltip.Content>{EARN_APY}</Tooltip.Content>
          </Tooltip>
        </div>
        <CommaNumber value={lendAPY} className="value" endingText="%" />
      </ThreeLevelListItem>
      <ThreeLevelListItem>
        <div className="name">{isSupplyActiveTab ? `m${symbol} Received` : 'Amount To Withdraw'}</div>
        <CommaNumber value={Number(amount)} className="value" />
      </ThreeLevelListItem>
      <ThreeLevelListItem className="right">
        <div className="name">New m{symbol} Balance</div>
        <CommaNumber value={futureMBalance} className="value" />
      </ThreeLevelListItem>
    </div>
  )
}
