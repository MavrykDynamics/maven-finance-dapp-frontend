import { useSelector } from 'react-redux'
import { useCallback, useContext, useMemo, useState } from 'react'

import {
  ACTION_PRIMARY,
  BUTTON_PRIMARY,
  BUTTON_WIDE,
  TRANSPARENT_WITH_BORDER,
} from 'app/App.components/Button/Button.constants'
import { LendingItemType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { State } from 'reducers'
import { loansPopupsContext } from './Modals/LoansModals.provider'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import {
  LENDING_TAB_SLIDING_BUTTONS,
  SECONDARY_TRANSACTION_HISTORY_STYLE,
  assetDecimalsToShow,
  loansTabNames,
} from '../Loans.const'

import { ThreeLevelListItem } from '../Loans.style'
import {
  LoansValuesSectionInfo,
  LoansValuesSection,
  LendingTabStyled,
  NoItemsInTabStyled,
  VaultsList,
  LoansActionsSection,
} from './LoansComponents.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { getLoansInputMaxAmount, isTezosAsset, loansInputValidation } from '../Loans.helpers'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { LENDING_TAB_SUPPLY_TEXT, LENDING_TAB_WITHDRAW_TEXT } from 'texts/banners/loan.text'
import { Input } from 'app/App.components/Input/NewInput'
import classNames from 'classnames'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from './Modals/Modals.helpers'
import { INPUT_LARGE, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { LENDING_APY } from 'texts/tooltips/loan.text'
import { TransactionHistory } from './TransactionHistory'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { openConfirmAddLendingAssetPopup, openConfirmRemoveLendingAssetPopup } = useContext(loansPopupsContext)
  const {
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { loanTokens } = useSelector((state: State) => state.loans)

  const [activeTab, setActiveTab] = useState(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.active))
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const currentToken = useMemo(() => {
    return loanTokens.find(({ loanTokenData }) => loanTokenData.symbol === assetData.symbol)
  }, [assetData, loanTokens])

  const balanceSymbol = isTezosAsset(assetData.symbol.toLowerCase() ?? '')
    ? 'tezos'
    : assetData.symbol.toLowerCase().toLowerCase() ?? ''
  const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

  const isSupplyActiveTab = activeTab?.id === loansTabNames.SUPPLY
  const isDisabledButton = useMemo(() => {
    return inputData.validationStatus !== INPUT_STATUS_SUCCESS || isActionActive
  }, [inputData.validationStatus, isActionActive])

  const handleSwitchTab = (tabId: number) => {
    setInputData(DEFAULT_LOANS_INPUT_VALUE)
    setActiveTab(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.id === tabId))
  }

  const handleClickButton = () => {
    if (!lendingItem) return

    switch (activeTab?.id) {
      case loansTabNames.SUPPLY:
        openConfirmAddLendingAssetPopup({
          inputAmount: Number(inputData.amount),
          mBalance: lendingItem.mBalance,
          lendingAPY: lendAPY,
          ...assetData,
        })

        break
      case loansTabNames.WITHDRAW:
        openConfirmRemoveLendingAssetPopup({
          inputAmount: Number(inputData.amount),
          mBalance: lendingItem.mBalance,
          lendingAPY: lendAPY,
          currentLendedAmount: lendingItem.lendValue,
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
          byDecimalPlaces: assetData.decimals || assetDecimalsToShow,
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
      ? onChangeHandler(getLoansInputMaxAmount(tokenBalance, assetData.decimals), tokenBalance)
      : onChangeHandler(
          getLoansInputMaxAmount(Math.min(lendingItem?.mBalance ?? 0, lendingItem?.lendValue ?? 0), assetData.decimals),
          Math.min(lendingItem?.mBalance ?? 0, lendingItem?.lendValue ?? 0),
        )
  }, [assetData, isSupplyActiveTab, lendingItem, onChangeHandler, tokenBalance])

  const inputOnChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeHandler(
        e.target.value,
        isSupplyActiveTab ? tokenBalance : Math.min(lendingItem?.mBalance ?? 0, lendingItem?.lendValue ?? 0),
      )
    },
    [isSupplyActiveTab, lendingItem, onChangeHandler, tokenBalance],
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
      balanceAsset: assetData.symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler,
      inputStatus: inputData.validationStatus,
      inputSize: INPUT_LARGE,
      ...(assetData.rate ? { convertedValue: assetData.rate * Number(inputData.amount) } : {}),
    }),
    [assetData, inputData.amount, inputData.validationStatus, tokenBalance, useMaxHandler],
  )

  return (
    <LendingTabStyled>
      {lendingItem && (
        <div className="stats-and-actions">
          <LoansValuesSection className="lending-tab">
            <H2Title>Your Supplied {assetData.symbol} Position</H2Title>

            <div className="stats">
              <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
                <CommaNumber
                  value={lendingItem.lendValue}
                  className="value"
                  showDecimal
                  decimalsToShow={assetDecimalsToShow}
                />

                <CommaNumber
                  value={lendingItem.lendValue * assetData.rate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                />

                <div className="name">
                  Supplied Amount
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
                <CommaNumber value={lendingItem.interestEarned} className="value" showDecimal />

                <CommaNumber
                  value={lendingItem.interestEarned * assetData.rate}
                  beginningText="$"
                  className="rate"
                  showDecimal
                />

                <div className="name">
                  Interest Earned
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo>
                <CommaNumber value={lendAPY} className="value" showDecimal />

                <div className="name margin-top">
                  Earn APY
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo>
                <CommaNumber
                  value={lendingItem.mBalance}
                  className="value"
                  showDecimal
                  decimalsToShow={assetDecimalsToShow}
                />

                <div className="name margin-top">
                  m{assetData.symbol} Balance
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>

              <LoansValuesSectionInfo hasRate={Boolean(assetData.rate)}>
                <CommaNumber value={tokenBalance} className="value" showDecimal decimalsToShow={assetDecimalsToShow} />
                <CommaNumber value={tokenBalance * assetData.rate} beginningText="$" className="rate" showDecimal />

                <div className="name">Wallet Balance</div>
              </LoansValuesSectionInfo>
            </div>

            <LoansValuesSectionInfo className="learn-more">
              <a href="https://mavryk.finance/litepaper#multi-collateral-vaults" target="_blank" rel="noreferrer">
                Learn more at the Mavryk Docs
              </a>
            </LoansValuesSectionInfo>
          </LoansValuesSection>

          <LoansActionsSection className="lending-tab">
            <div className="switchers">
              <SlidingTabButtons onClick={handleSwitchTab} tabItems={LENDING_TAB_SLIDING_BUTTONS} className="vault" />
            </div>

            <div className="tab-text">{isSupplyActiveTab ? LENDING_TAB_SUPPLY_TEXT : LENDING_TAB_WITHDRAW_TEXT}</div>

            <div>
              <div className="tab-text">Select Amount to {isSupplyActiveTab ? 'Supply' : 'Withdraw'}</div>

              <Input
                className={classNames('pinned-dropdown', { 'input-with-rate': assetData.rate })}
                inputProps={inputProps}
                settings={settings}
              >
                <InputPinnedTokenInfo>
                  <ImageWithPlug imageLink={assetData.icon} alt={`${assetData.symbol} icon`} /> {assetData?.symbol}
                </InputPinnedTokenInfo>
              </Input>
            </div>

            <div className="mt-25">
              <div className="tab-text mb-10">Updated Lending {assetData?.symbol} Stats</div>

              <div className="stats">
                <ThreeLevelListItem>
                  <div className="name">
                    Lending APY
                    <CustomTooltip iconId="info" text={LENDING_APY(assetData.symbol)} />
                  </div>
                  <CommaNumber value={lendAPY} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    {isSupplyActiveTab ? `m${assetData.symbol} Received` : 'Amount To Withdraw'}
                  </div>
                  <CommaNumber value={Number(inputData.amount)} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">New m{assetData.symbol} Balance</div>
                  <CommaNumber value={lendingItem.mBalance + Number(inputData.amount)} className="value" />
                </ThreeLevelListItem>
              </div>
            </div>

            <div className="button-wrapper">
              <NewButton
                kind={BUTTON_PRIMARY}
                form={BUTTON_WIDE}
                onClick={handleClickButton}
                disabled={isDisabledButton}
              >
                <Icon id="loans" />
                {isSupplyActiveTab ? 'Deposit' : 'Remove Asset'}
              </NewButton>
            </div>
          </LoansActionsSection>
        </div>
      )}

      <TransactionHistory
        currentToken={currentToken}
        lendingControllerAddress={lendingControllerAddress}
        styleType={SECONDARY_TRANSACTION_HISTORY_STYLE}
      />
    </LendingTabStyled>
  )
}
