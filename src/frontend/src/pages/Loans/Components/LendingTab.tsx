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
import { LENDING_TAB_SLIDING_BUTTONS, assetDecimalsToShow, loansTabNames } from '../Loans.const'

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

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { openAddLendingAssetPopup, openRemoveLendingAssetPopup } = useContext(loansPopupsContext)
  const {
    accountPkh,
    user: { userTokens },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [activeTab, setActiveTab] = useState(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.active))
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const balanceSymbol = isTezosAsset(assetData.symbol.toLowerCase() ?? '')
    ? 'tezos'
    : assetData.symbol.toLowerCase().toLowerCase() ?? ''
  const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

  const isSupplyActiveTab = activeTab?.id === loansTabNames.SUPPLY
  const isDisabledButton = useMemo(() => {
    return inputData.validationStatus !== INPUT_STATUS_SUCCESS
  }, [inputData.validationStatus])

  const handleSwitchTab = (tabId: number) => {
    setActiveTab(LENDING_TAB_SLIDING_BUTTONS.find((item) => item.id === tabId))
  }

  const handleClickButton = () => {}

  const onChangeHandler = useCallback(
    (inputAmount: string, userBalance: number) => {
      const validationStatus = loansInputValidation({
        inputAmount,
        maxAmount: userBalance,
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

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeHandler(e.target.value, tokenBalance),
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
    }),
    [inputData.amount, inputOnBlurHandle, onChangeHandler, onFocusHandler, tokenBalance],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: tokenBalance,
      balanceAsset: assetData.symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () => onChangeHandler(getLoansInputMaxAmount(tokenBalance, assetData.decimals), tokenBalance),
      inputStatus: inputData.validationStatus,
      inputSize: INPUT_LARGE,
      ...(assetData.rate ? { convertedValue: assetData.rate * Number(inputData.amount) } : {}),
    }),
    [assetData, inputData.amount, inputData.validationStatus, onChangeHandler, tokenBalance],
  )

  return (
    <LendingTabStyled>
      {lendingItem ? (
        <div className="main">
          <LoansValuesSection className="secondary-background">
            <H2Title>Your Supplied XTZ Position</H2Title>

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

                <div className="name">
                  Wallet Balance
                  <CustomTooltip iconId="info" text={''} />
                </div>
              </LoansValuesSectionInfo>
            </div>

            <LoansValuesSectionInfo className="learn-more">
              <a href="https://mavryk.finance/litepaper#multi-collateral-vaults" target="_blank" rel="noreferrer">
                Learn more at the Mavryk Docs
              </a>
            </LoansValuesSectionInfo>
          </LoansValuesSection>

          <LoansActionsSection className="secondary-background">
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

            <div>
              <div className="tab-text mb-10">Updated Lending {assetData?.symbol} Stats</div>

              <div className='stats'>
                <ThreeLevelListItem>
                  <div className="name">
                    Lending APY
                    <CustomTooltip
                      iconId="info"
                      text={`You will receive m${assetData.symbol} instead of your ${assetData.symbol}`}
                    />
                  </div>
                  <CommaNumber value={lendAPY} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">m{assetData.symbol} Received</div>
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
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>
          <Button
            text="Lend Asset"
            icon="plus"
            kind={ACTION_PRIMARY}
            disabled={!Boolean(accountPkh) || isActionActive}
            onClick={() =>
              openAddLendingAssetPopup({
                mBalance: 0,
                lendingAPY: lendAPY,
                ...assetData,
              })
            }
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
    </LendingTabStyled>
  )
}
