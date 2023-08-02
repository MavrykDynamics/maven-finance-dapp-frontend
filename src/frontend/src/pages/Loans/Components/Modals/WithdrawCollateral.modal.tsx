import { useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useCallback, useEffect, useMemo, useState } from 'react'

// consts
import {
  ERR_MSG_INPUT,
  ERR_MSG_TOAST,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { WITHDRAW_COLLATERAL_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

// types
import { WithdrawCollateralPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { State } from 'reducers'

// actions
import {
  withdrawCollateralAction,
  withdrawStakedCollateralAction,
} from 'providers/VaultsProvider/actions/vaultCollateral.actions'

import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import {
  getCollateralRatioByPersentage,
  getLoansInputMaxAmount,
  getMaxCollateralWithdraw,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'
import { checkNan } from 'utils/checkNan'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// utils
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { validateInputLength } from 'app/App.utils/input/validateInput'

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
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { isActionActive } = useSelector((state: State) => state.loading)

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

  const borrowedToken = getTokenDataByAddress({
    tokenAddress: data?.borrowedTokenAddress,
    tokensMetadata,
    tokensPrices,
  })
  const collateralToken = getTokenDataByAddress({
    tokenAddress: data?.collateralTokenAddress,
    tokensMetadata,
    tokensPrices,
  })

  const {
    vaultAddress = '',
    vaultId = 0,
    collateralBalance = 0,
    collateralRatio = 0,
    borrowedAmount = 0,
    collateralTokenAddress = '',
  } = data ?? {}

  const { rate: originalCollateralRate, decimals, name, icon, symbol } = collateralToken ?? {}
  const collateralRate = originalCollateralRate ?? 0
  const userCollateralBalance = getUserTokenBalanceByAddress({
    userTokensBalances,
    tokenAddress: collateralTokenAddress,
  })
  const { rate: originalborrowedTokenRate } = borrowedToken ?? {}
  const borrowedTokenRate = originalborrowedTokenRate ?? 0

  const futureCollateralRatio = getVaultCollateralRatio(
    collateralBalance - inputAmount * collateralRate,
    borrowedAmount * borrowedTokenRate,
  )

  const currentCollateralToWithdraw = getMaxCollateralWithdraw(
    collateralBalance - inputAmount * collateralRate,
    collateralBalance,
    borrowedAmount,
    borrowedTokenRate,
    collateralRate,
  )

  const futureCollateralWithdraw = currentCollateralToWithdraw - inputAmount
  const futureVaultCollateralBalance = collateralBalance - inputAmount * collateralRate

  const isActionBtnDisabled =
    isActionActive || inputData.validationStatus !== INPUT_STATUS_SUCCESS || futureCollateralRatio <= 200

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
  }, [userAddress, collateralToken, vaultAddress, bug, inputData.amount, closePopup])

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

          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(collateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio: <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={getCollateralRatioByPersentage(collateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={collateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Withdrawable Collateral{' '}
                <CustomTooltip
                  iconId="info"
                  text="Dollar value of collateral you are able to withdraw without making your vault under-collateralized for this specific collateral asset"
                  defaultStrokeColor={colors[themeSelected].textColor}
                />
              </div>
              <CommaNumber value={currentCollateralToWithdraw * collateralRate} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <hr />
          {collateralToken ? (
            <Input
              className={`${collateralRate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
              inputProps={{
                value: inputData.amount,
                type: 'number',
                onBlur: inputOnBlurHandle,
                onFocus: onFocusHandler,
                onChange: (e) => inputOnChangeHandle(e.target.value, currentCollateralToWithdraw),
              }}
              settings={{
                balance: userCollateralBalance,
                balanceAsset: symbol,
                useMaxHandler: () =>
                  inputOnChangeHandle(
                    getLoansInputMaxAmount(currentCollateralToWithdraw, decimals),
                    currentCollateralToWithdraw,
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
          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(futureCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={futureVaultCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Withdrawable Collateral{' '}
                <CustomTooltip
                  iconId="info"
                  text="Dollar value of collateral you are able to withdraw without making your vault under-collateralized for this specific collateral asset"
                  defaultStrokeColor={colors[themeSelected].textColor}
                />
              </div>
              <CommaNumber value={futureCollateralWithdraw * collateralRate} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

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
