import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { checkNan } from 'utils/checkNan'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useCreateVaultContext } from '../helpers/createVaultModalContext'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import colors, { silverColor } from 'styles/colors'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { BorrowScreenWrapper } from '../createNewVault.style'
import { AVALIABLE_TO_BORROW, DAO_FEE, TOTAL_AMOUNT } from 'texts/tooltips/vault.text'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { getCollateralRatioByPersentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { CONFIRMATION_SCREEN_ID } from '../helpers/createNewVault.consts'
import Icon from 'app/App.components/Icon/Icon.view'

// ------------------------------------------------------------------

const vaultObj = {
  borrowedTokenAddress: 'KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm',
  name: 'Jupiter 2',
  address: 'KT1UCFPPgutMkkt3xBpSyAxH6piRjzxyiyiz',
  ownerAddress: 'tz1byTGaUKjJqkwSXPnM3dpf9N39pYwRfnTm',
  vaultId: 148,
  apr: 25.77473656078835,
  creationTimestamp: 1683191753000,
  borrowedAmount: 1000000,
  availableLiquidity: 35244409.30000001,
  minimumRepay: 10000,
  fee: 48858.27958072885,
  collateralData: [
    {
      tokenAddress: 'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg',
      amount: 23000000,
    },
  ],
  liquidationMax: 509741,
  liquidationReward: 0.06,
  adminLiquidateFee: 600,
  liquidationRatio: 1500,
  liquidationLvl: null,
  sMVKDelegatedTo: '',
  xtzDelegatedTo: 'tz1Qf1pSbJzMN4VtGFfVJRgbXhBksRv36TxW',
  depositors: [],
  deporsitorsFlag: 'any',
}
// ------------------------------------------------------------------

export const BorrowScreen = () => {
  const {
    preferences: { themeSelected },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { userTokensBalances } = useUserContext()
  const { newVault, updateScreenToShow } = useCreateVaultContext()
  const { vaultsMapper } = useVaultsContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const currentVault = vaultsMapper[newVault?.id.toString() ?? '']
  // TODO replace with NewVault data from modal screens context
  // const vaultData = useFullVault(currentVault)
  const vaultData = useFullVault(vaultObj as any)

  const {
    borrowedTokenAddress: borrowedAssetAddress = '',
    borrowCapacity = 0,
    borrowedAmount: currentBorrowedAmount = 0,
    collateralBalance: currentCollateralBalance = 0,
  } = vaultData ?? {}

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { symbol, decimals, icon } = tokensMetadata[borrowedAssetAddress]
  const rate = tokensPrices[symbol]

  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })
  const inputAmount = checkNan(parseFloat(inputData.amount))
  const isDisabledButton = inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive

  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedAssetAddress })

  // -------------------------------------------------------------------------------------

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  const clearData = () => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }

  // stuff to handle inputs
  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
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

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => inputOnChangeHandle(e.target.value, borrowCapacity / rate),
    }),
    [borrowCapacity, rate, inputData.amount, inputOnBlurHandle, inputOnChangeHandle, onFocusHandler],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () =>
        inputOnChangeHandle(getLoansInputMaxAmount(borrowCapacity / rate, decimals), borrowCapacity / rate),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * rate,
      inputSize: INPUT_LARGE,
    }),
    [
      userAssetBalance,
      symbol,
      inputData.validationStatus,
      inputAmount,
      rate,
      inputOnChangeHandle,
      borrowCapacity,
      decimals,
    ],
  )
  // -------------------------------------------------------------------------------------

  // TODO sxtract to custom hook (same code <BorrowingExpandCardBorrowSection />)
  return (
    <BorrowScreenWrapper>
      <div className="borrow-screen-top-stats">
        <ThreeLevelListItem>
          <div className="name">
            Borrow Capacity
            <CustomTooltip
              iconId="info"
              defaultStrokeColor={colors[themeSelected].textColor}
              text={'tooltip text'}
              className="tooltip"
            />
          </div>
          <CommaNumber value={132916489} decimalsToShow={0} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Collateral Utilization</div>
          <div className="value">Not Relevant</div>
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Borrow APR</div>
          <CommaNumber value={22.5} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">
            DAO Fee
            <CustomTooltip
              iconId="info"
              defaultStrokeColor={colors[themeSelected].textColor}
              text={'tooltip text'}
              className="tooltip"
            />
          </div>
          <CommaNumber value={daoFee} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
      </div>

      <div className="borrow-screen-input-wrapper">
        <div className="block-name">Select the amount to borrow</div>

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
      <div className="borrow-screen-bottom-stats">
        <div className="block-name">New Vault stats</div>
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
                value={inputAmount * (daoFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount Received</div>
              <CommaNumber
                value={inputAmount - inputAmount * (daoFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
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

      <div className="manage-btn">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={() => {
            clearData()
            updateScreenToShow(CONFIRMATION_SCREEN_ID)
          }}
          disabled={isDisabledButton}
        >
          Borrow
          <Icon id="arrowRight" />
        </NewButton>
      </div>
    </BorrowScreenWrapper>
  )
}
