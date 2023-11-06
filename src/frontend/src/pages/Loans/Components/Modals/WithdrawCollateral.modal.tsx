import {useLockBodyScroll} from 'react-use'
import {useCallback, useEffect, useMemo, useState} from 'react'

// consts
import {
  ERR_MSG_INPUT,
  getOnBlurValue,
  getOnFocusValue,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import {COLLATERAL_RATIO_GRADIENT, getCollateralRatioPercentColor} from 'pages/Loans/Loans.const'
import colors from 'styles/colors'
import {BUTTON_PRIMARY, BUTTON_WIDE} from 'app/App.components/Button/Button.constants'
import {
  MINIMUN_COLLATERAL_RATIO_PERSENT,
  WITHDRAW_COLLATERAL_ACTION,
} from 'providers/VaultsProvider/helpers/vaults.const'

// types
import {ThemeType} from 'consts/theme.const'
import {WithdrawCollateralPopupDataType} from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// actions
import {
  withdrawCollateralAction,
  withdrawStakedCollateralAction,
} from 'providers/VaultsProvider/actions/vaultCollateral.actions'

// view
import {Input} from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import {GradientDiagram} from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton'
import {CommaNumber} from 'app/App.components/CommaNumber/CommaNumber.controller'
import {LoansModalBase, VaultModalOverview} from './Modals.style'
import {GovRightContainerTitleArea} from 'pages/Governance/Governance.style'
import {InputPinnedTokenInfo} from 'app/App.components/Input/Input.style'
import {ThreeLevelListItem} from 'pages/Loans/Loans.style'
import {PopupContainer, PopupContainerWrapper} from 'app/App.components/popup/PopupMain.style'
import {ImageWithPlug} from 'app/App.components/Icon/ImageWithPlug'

// utils
import {checkWhetherTokenIsCollateralToken, getTokenDataByAddress,} from 'providers/TokensProvider/helpers/tokens.utils'
import {
  getCollateralRatioByPercentage,
  getLoansInputMaxAmount,
  getMaxCollateralWithdraw,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import {checkNan} from 'utils/checkNan'
import {validateInputLength} from 'app/App.utils/input/validateInput'
import {getUserTokenBalanceByAddress} from 'providers/UserProvider/helpers/userBalances.helpers'

// hooks
import {useTokensContext} from 'providers/TokensProvider/tokens.provider'
import {useDappConfigContext} from 'providers/DappConfigProvider/dappConfig.provider'
import {useUserContext} from 'providers/UserProvider/user.provider'
import {useToasterContext} from 'providers/ToasterProvider/toaster.provider'
import {HookContractActionArgs, useContractAction} from 'app/App.hooks/useContractAction'
import {operationRemoveCollateral, useVaultFutureStats} from 'providers/VaultsProvider/hooks/useVaultFutureStats'
import {Tooltip} from 'app/App.components/Tooltip/Tooltip'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239234&t=Sx2aEpp3ifrGxBtQ-0
export const WithdrawCollateral = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: WithdrawCollateralPopupDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const {
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const {
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()

  useLockBodyScroll(show)

  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })

  const inputAmount = checkNan(parseFloat(inputData.amount))

  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
    }
  }, [show])

  const {
    vaultAddress,
    vaultId,
    collateralBalance,
    collateralRatio,
    selectedCollateralAmountInVault,
    collateralTokenAddress,
    borrowedTokenAddress,
    currentTotalOutstanding,
    availableLiquidity,
  } = data

  const borrowedToken = getTokenDataByAddress({
    tokenAddress: borrowedTokenAddress,
    tokensMetadata,
    tokensPrices,
  })
  const { rate: originalBorrowedTokenRate = 0 } = borrowedToken ?? {}
  const borrowedTokenRate = originalBorrowedTokenRate ?? 0

  const collateralToken = getTokenDataByAddress({
    tokenAddress: collateralTokenAddress,
    tokensMetadata,
    tokensPrices,
  })
  const { rate: originalCollateralRate, decimals, icon, symbol } = collateralToken ?? {}
  const collateralRate = originalCollateralRate ?? 0

  const userCollateralBalance = getUserTokenBalanceByAddress({
    userTokensBalances,
    tokenAddress: collateralTokenAddress,
  })

  const currentCollateralToWithdraw = getMaxCollateralWithdraw(
    collateralBalance,
    currentTotalOutstanding * borrowedTokenRate,
    collateralRate,
  )

  const futureCollateralWithdraw = currentCollateralToWithdraw - inputAmount

  const { futureCollateralRatio, futureCollateralBalance } = useVaultFutureStats({
    vaultCurrentTotalOutstanding: currentTotalOutstanding,
    vaultCurrentCollateralBalance: collateralBalance,
    vaultTokenAddress: borrowedTokenAddress,
    collateralTokenAddress,
    inputValue: inputAmount,
    marketAvailableLiquidity: availableLiquidity,
    operationType: operationRemoveCollateral,
  })

  const isActionBtnDisabled =
    isActionActive ||
    inputData.validationStatus !== INPUT_STATUS_SUCCESS ||
    futureCollateralRatio <= MINIMUN_COLLATERAL_RATIO_PERSENT

  // withdraw collateral action ----------------------------------------------
  const withdrawAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (
      collateralToken &&
      vaultAddress &&
      lendingControllerAddress &&
      checkWhetherTokenIsCollateralToken(collateralToken)
    ) {
      if (collateralToken.loanData.isStaked) {
        return await withdrawStakedCollateralAction(
          Number(inputData.amount),
          collateralToken,
          vaultId,
          lendingControllerAddress,
          closePopup,
        )
      } else {
        return await withdrawCollateralAction(Number(inputData.amount), collateralToken, vaultAddress, closePopup)
      }
    }

    return null
  }, [userAddress, collateralToken, vaultAddress, lendingControllerAddress, inputData.amount, vaultId, closePopup])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: WITHDRAW_COLLATERAL_ACTION,
      actionFn: withdrawAction,
    }),
    [withdrawAction],
  )

  const { action: withdrawHandler } = useContractAction(contractActionProps)

  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount,
      options: {
        byDecimalPlaces: decimals,
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

  if (!data || !borrowedToken || !borrowedToken.rate || !collateralToken || !collateralToken.rate) return null

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Withdraw Collateral from a Vault</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select one or multiple assets to remove as collateral from the vault.</div>

          <WithdrawCollateralTableStats
            collateralRatio={collateralRatio}
            collateralBalance={collateralBalance}
            currentCollateralToWithdraw={currentCollateralToWithdraw}
            collateralRate={collateralRate}
            themeSelected={themeSelected}
            validationStatus={inputData.validationStatus}
          />

          <hr />
          {collateralToken ? (
            <Input
              className={`${collateralRate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
              inputProps={{
                value: inputData.amount,
                type: 'number',
                onBlur: inputOnBlurHandle,
                onFocus: onFocusHandler,
                onChange: (e) =>
                  inputOnChangeHandle(
                    e.target.value,
                    Math.min(currentCollateralToWithdraw, selectedCollateralAmountInVault),
                  ),
              }}
              settings={{
                balance: userCollateralBalance,
                balanceAsset: symbol,
                useMaxHandler: () =>
                  inputOnChangeHandle(
                    getLoansInputMaxAmount(
                      Math.min(selectedCollateralAmountInVault, currentCollateralToWithdraw),
                      decimals,
                    ),
                    Math.min(currentCollateralToWithdraw, selectedCollateralAmountInVault),
                  ),
                inputStatus: inputData.validationStatus,
                convertedValue: inputAmount * collateralRate,
                inputSize: INPUT_LARGE,
                validationFns: [[validateInputLength, ERR_MSG_INPUT]],
              }}
            >
              <InputPinnedTokenInfo>
                <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
              </InputPinnedTokenInfo>
            </Input>
          ) : null}
          <div className="block-name">New Vault Status</div>

          <WithdrawCollateralTableStats
            collateralRatio={futureCollateralRatio}
            collateralBalance={futureCollateralBalance}
            currentCollateralToWithdraw={futureCollateralWithdraw}
            collateralRate={collateralRate}
            themeSelected={themeSelected}
            validationStatus={inputData.validationStatus}
          />

          <div className="manage-btn">
            <NewButton
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              onClick={withdrawHandler}
              disabled={isActionBtnDisabled}
            >
              <Icon id="minus" />
              Remove
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

const WithdrawCollateralTableStats = ({
  collateralRatio,
  collateralBalance,
  currentCollateralToWithdraw,
  collateralRate,
  themeSelected,
  validationStatus,
}: {
  collateralRatio: number
  collateralBalance: number
  currentCollateralToWithdraw: number
  collateralRate: number
  themeSelected: ThemeType
  validationStatus: InputStatusType
}) => {
  return (
    <VaultModalOverview>
      <ThreeLevelListItem
        className="collateral-diagram"
        customColor={getCollateralRatioPercentColor(colors[themeSelected], collateralRatio)}
      >
        <div className={`percentage`}>
          Collateral Ratio:{' '}
          <CommaNumber
            value={collateralRatio}
            endingText="%"
            showDecimal
            decimalsToShow={2}
            beginningText={collateralRatio === 1000 ? '+' : ''}
          />
        </div>
        <GradientDiagram
          className="diagram"
          colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
          currentPercentage={getCollateralRatioByPercentage(collateralRatio)}
        />
      </ThreeLevelListItem>
      <ThreeLevelListItem>
        <div className="name">Collateral Value</div>
        <CommaNumber value={collateralBalance} className="value" beginningText="$" />
      </ThreeLevelListItem>
      <ThreeLevelListItem>
        <div className="name">
          Withdrawable Collateral
          <Tooltip>
            <Tooltip.Trigger className="ml-3">
              <Icon id="info" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              Dollar value of collateral you are able to withdraw without making your vault under-collateralized for
              this specific collateral asset.
            </Tooltip.Content>
          </Tooltip>
        </div>
        <CommaNumber value={currentCollateralToWithdraw * collateralRate} className="value" beginningText="$" />
      </ThreeLevelListItem>
    </VaultModalOverview>
  )
}
