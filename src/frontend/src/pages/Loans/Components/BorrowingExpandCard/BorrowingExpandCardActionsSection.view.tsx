import { useEffect, useMemo, useState } from 'react'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import {
  BorrowingExpandCardActionsSectionStyled,
  VaultOverview,
  StatusMessageStyled,
} from '../LoansComponents.style'
import {
  COLLATERAL_RATIO_GRADIENT,
  VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS,
  VAULT_CARD_REPAY_SLIDING_BUTTONS,
  assetDecimalsToShow,
  getCollateralRationPersent,
  vaultCardTabNames,
} from 'pages/Loans/Loans.const'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { calcCollateralRatio, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from '../Modals/Modals.helpers'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { borrowVaultAssetAction } from 'pages/Loans/Actions/vault.actions'
import { INPUT_LARGE } from 'app/App.components/Input/Input.constants'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { VaultModalOverview } from '../Modals/Modals.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { silverColor } from 'styles'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'

type Props = {
  vaultId: number
  borrowedAsset: LoansVaultType['borrowedAsset']
  borrowCapacity: number
  collateralRatio: number
  borrowAPR: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  DAOFee: number
  currentBorrowedAmount: number
  scrollToCurrentVault?: () => void
}

export const BorrowingExpandCardActionsSection = (props: Props) => {
  const dispatch = useDispatch()

  const {
    vaultId,
    borrowedAsset,
    borrowCapacity = 0,
    collateralRatio = 0,
    borrowAPR = 0,
    hasUserBorrowed,
    currentBorrowedAmount = 0,
    currentCollateralBalance = 0,
    DAOFee = 0,
    scrollToCurrentVault,
  } = props

  const repayBorrowSlidingButtons = useMemo(
    () =>
      VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.map((item) => ({
        ...item,
        text: `${item.text} ${borrowedAsset?.symbol}`,
      })),
    [borrowedAsset?.symbol],
  )

  const [activeRepayBorrowTab, setActiveRepayBorrowTab] = useState(
    repayBorrowSlidingButtons.find((item) => item.active),
  )
  const [activeRepayTab, setActiveRepayTab] = useState(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.active))

  const handleSwitchTab = (setActiveTab: (tab?: TabItem) => void) => (tabId: number) => {
    const tabs = repayBorrowSlidingButtons.concat(VAULT_CARD_REPAY_SLIDING_BUTTONS)

    setActiveTab(tabs.find((item) => item.id === tabId))
  }

  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { userTokens } = useSelector((state: State) => state.wallet.user)

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)
  const userAssetBalance = userTokens[borrowedAsset?.symbol ?? '']?.balance ?? 0

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, currentBorrowedAmount + inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = borrowCapacity - inputAmount * (borrowedAsset?.rate ?? 0)

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, currentBorrowedAmount, inputAmount, borrowCapacity])

  const showWarning = inputAmount > borrowCapacity / (borrowedAsset?.rate ?? 0) || futureCollateralRatio < 200

  useEffect(() => {
    setInputData(DEFAULT_LOANS_INPUT_VALUE)
  }, [activeRepayBorrowTab, activeRepayTab])

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount,
      options: {
        byDecimalPlaces: borrowedAsset?.decimals || assetDecimalsToShow,
      },
    })

    setInputData({
      ...inputData,
      amount: newInputAmount,
      validationStatus: validationStatus,
    })
  }

  const inputOnBlurHandle = () => {
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })
  }

  const onFocusHandler = () => {
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })
  }

  const handleClickBorrow = async () => {
    if (vaultId && borrowedAsset) {
      await dispatch(
        borrowVaultAssetAction(
          vaultId,
          Number(inputData.amount),
          borrowedAsset.decimals,
          () => {}, // TODO: remove
          scrollToCurrentVault,
        ),
      )
    }
  }

  return (
    <BorrowingExpandCardActionsSectionStyled>
      <div className="switchers">
        <SlidingTabButtons
          onClick={handleSwitchTab(setActiveRepayBorrowTab)}
          tabItems={repayBorrowSlidingButtons}
          className="vault"
        />
        {activeRepayBorrowTab?.id === vaultCardTabNames.REPAY && (
          <SlidingTabButtons
            onClick={handleSwitchTab(setActiveRepayTab)}
            tabItems={VAULT_CARD_REPAY_SLIDING_BUTTONS}
            className="vault"
          />
        )}
      </div>

      <div className="tab-text">
        Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
      </div>

      <div>
        <div className="tab-text">Select Amount to Borrow</div>
        {borrowedAsset ? (
          <Input
            className={`${borrowedAsset.rate ? 'input-with-rate' : ''} pinned-dropdown`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onBlur: inputOnBlurHandle,
              onFocus: onFocusHandler,
              onChange: (e) => inputOnChangeHandle(e.target.value, borrowCapacity / borrowedAsset.rate),
            }}
            settings={{
              balance: userAssetBalance,
              balanceAsset: borrowedAsset?.symbol,
              useMaxHandler: () =>
                inputOnChangeHandle(
                  getLoansInputMaxAmount(borrowCapacity / borrowedAsset.rate, borrowedAsset.decimals),
                  borrowCapacity / borrowedAsset.rate,
                ),
              inputStatus: inputData.validationStatus,
              convertedValue: inputAmount * borrowedAsset.rate,
              inputSize: INPUT_LARGE,
            }}
          >
            <InputPinnedTokenInfo>
              <ImageWithPlug imageLink={borrowedAsset.icon} alt={`${borrowedAsset.symbol} icon`} />{' '}
              {borrowedAsset?.symbol}
            </InputPinnedTokenInfo>
          </Input>
        ) : null}
      </div>

      {showWarning ? (
        <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE}`}>
          <Icon id="error-triangle" />
          {futureCollateralRatio < 200
            ? 'The amount you wish to borrow would under-collateralize your vault. Please enter a different amount to borrow so your vault will not be under-collateralized when you borrow.'
            : 'Select the amount you would like to borrow. You cannot borrow more than your borrow capacity.'}
        </StatusMessageStyled>
      ) : null}

      <div className={!showWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Borrow {borrowedAsset?.symbol} Stats</div>
        <VaultOverview>
          <div className="line">
            <ThreeLevelListItem>
              <div className="name">
                Total Amount
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={silverColor}
                  text={`Total amount you are borrowing, a portion of which is paid to the treasury as the DAO fee. The amount you will actually receive is the Total Amount minus the DAO fee.`}
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
                  defaultStrokeColor={silverColor}
                  text={`Amount paid to the DAO as the origination fee for borrowing. Each time you borrow, a fee is paid.`}
                  className="tooltip"
                />
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

            <ThreeLevelListItem>
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
                currentPersentage={Math.max(0, Math.min(((futureCollateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>

            <ThreeLevelListItem className="right">
              <div className="name">
                Available To Borrow
                <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text="something" className="tooltip" />
              </div>
              <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>
        </VaultOverview>
      </div>

      <div className="button-wrapper">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={handleClickBorrow}>
          <Icon id="coin-loan" />
          Borrow
        </NewButton>
      </div>
    </BorrowingExpandCardActionsSectionStyled>
  )
}
