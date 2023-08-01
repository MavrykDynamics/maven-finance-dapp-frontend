import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { DEPOSIT_COLLATERAL_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

// types
import { AddCollateralPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// components
import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// styles
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'

// actions
import { depositCollateralsAction } from 'providers/VaultsProvider/actions/vaultCollateral.actions'

// helpers
import { checkNan } from 'utils/checkNan'
import { getCollateralRatioByPersentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import colors from 'styles/colors'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239476&t=Sx2aEpp3ifrGxBtQ-0
export const AddCollateral = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: AddCollateralPopupDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const {
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()

  useLockBodyScroll(show)

  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })

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
    collateralBalance = 0,
    vaultAddress = '',
    vaultId = 0,
    collateralRatio = 0,
    borrowedAmount = 0,
    borrowCapacity = 0,
    availableLiquidity = 0,
    collateralTokenAddress = '',
  } = data ?? {}

  const { rate: originalCollateralRate = 0, decimals = 0, symbol = '', name = '', icon = '' } = collateralToken ?? {}
  const collateralRate = originalCollateralRate ?? 0
  const userCollateralBalance = getUserTokenBalanceByAddress({
    userTokensBalances,
    tokenAddress: collateralTokenAddress,
  })
  const { rate: originalBorrowedTokenRate } = borrowedToken ?? {}
  const borrowedTokenRate = originalBorrowedTokenRate ?? 0

  const inputAmount = checkNan(parseFloat(inputData.amount))
  const futureCollateralRatio = getVaultCollateralRatio(
    collateralBalance + inputAmount * collateralRate,
    borrowedAmount * borrowedTokenRate,
  )

  const futureCollateralBalance = collateralBalance + inputAmount * collateralRate
  const futureBorrowCapacity = Math.min(
    Math.max(availableLiquidity, 0),
    futureCollateralBalance / 2 - borrowedAmount * borrowedTokenRate,
  )

  // deposit action
  const depositAction = useCallback(async () => {
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
      return await depositCollateralsAction(
        userAddress,
        vaultAddress,
        [
          {
            ...collateralToken,
            amount: convertNumberForContractCall({
              number: Number(inputData.amount),
              grade: decimals,
            }),
          },
        ],
        vaultId,
        lendingControllerAddress,
        closePopup,
      )
    }

    return null
  }, [userAddress, collateralToken, vaultAddress, bug, inputData.amount, decimals, closePopup])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DEPOSIT_COLLATERAL_ACTION,
      actionFn: depositAction,
    }),
    [depositAction],
  )

  const { action: depositCollateralHandler } = useContractAction(contractActionProps)

  // stuff to handle inputs
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
            <h2>Add Collateral To Vault</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select one or multiple assets to add as collateral to the vault.</div>

          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(colors[themeSelected], collateralRatio)}
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
                Available to Borrow
                <CustomTooltip
                  text="The available to borrow metric takes 2 separate values into account. The borrow capacity of your vault AND the availableLiquidity of the asset pool your vault is borrowing from. The equation used is: min(availableLiquidityuidity, vaultCollateralValue / 2 - borrowedAmount)"
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].subHeadingText}
                />
              </div>
              <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <hr />

          <Input
            className={`input-with-rate pinned-dropdown mb-45`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onFocus: onFocusHandler,
              onBlur: inputOnBlurHandle,
              onChange: (e) => inputOnChangeHandle(e.target.value, userCollateralBalance),
            }}
            settings={{
              balance: userCollateralBalance,
              balanceAsset: symbol,
              useMaxHandler: () =>
                inputOnChangeHandle(getLoansInputMaxAmount(userCollateralBalance, decimals), userCollateralBalance),
              inputStatus: inputData.validationStatus,
              convertedValue: inputAmount * (collateralRate ?? 1),
              inputSize: INPUT_LARGE,
            }}
          >
            <InputPinnedTokenInfo>
              <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
            </InputPinnedTokenInfo>
          </Input>

          <div className="block-name">New Vault Status</div>
          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(colors[themeSelected], futureCollateralRatio)}
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
              <CommaNumber value={futureCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Available to Borrow
                <CustomTooltip
                  text="The available to borrow metric takes 2 separate values into account. The borrow capacity of your vault AND the availableLiquidity of the asset pool your vault is borrowing from. The equation used is: min(availableLiquidityuidity, vaultCollateralValue / 2 - borrowedAmount)"
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].subHeadingText}
                />
              </div>
              <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <div className="manage-btn">
            <NewButton
              kind={BUTTON_PRIMARY}
              onClick={depositCollateralHandler}
              form={BUTTON_WIDE}
              disabled={inputData.validationStatus === INPUT_STATUS_ERROR}
            >
              <Icon id="plus" />
              Deposit
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
