import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import {
  ERR_MSG_INPUT,
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
import { silverColor } from 'styles'
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
import { getVaultBorrowCapacity, getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { MemoizedComponent } from 'app/App.HOC/MemoizedComponent'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { useCollateralInputData } from './hooks/Market/useCollateralInputData'
import { XTZLimitInfoBanner } from './components/XTZLimitInfoBanner'

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
  const { userTokensBalances, userAddress } = useUserContext()
  const {
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()

  useLockBodyScroll(show)

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
    totalOutstanding = 0,
    borrowCapacity = 0,
    availableLiquidity = 0,
    collateralTokenAddress = '',
  } = data ?? {}

  const {
    inputData,
    setInputData,
    setSelectedCollateral,
    inputOnBlurHandle,
    inputOnChangeHandle,
    willExceedXTZTheLimit,
    onFocusHandler,
    useMaxHandler,
  } = useCollateralInputData()

  useEffect(() => {
    setSelectedCollateral(collateralTokenAddress)
  }, [collateralTokenAddress, setSelectedCollateral])

  const { rate: originalCollateralRate = 0, decimals = 0, symbol = '', icon = '' } = collateralToken ?? {}
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
    totalOutstanding * borrowedTokenRate,
  )

  const futureCollateralBalance = collateralBalance + inputAmount * collateralRate
  const futureBorrowCapacity = getVaultBorrowCapacity(
    availableLiquidity * borrowedTokenRate,
    totalOutstanding * borrowedTokenRate,
    futureCollateralBalance,
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
  }, [
    userAddress,
    collateralToken,
    vaultAddress,
    lendingControllerAddress,
    bug,
    inputData.amount,
    decimals,
    vaultId,
    closePopup,
  ])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DEPOSIT_COLLATERAL_ACTION,
      actionFn: depositAction,
    }),
    [depositAction],
  )

  const { action: depositCollateralHandler } = useContractAction(contractActionProps)

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

          <AddCollateralTableStats
            collateralRatio={collateralRatio}
            collateralBalance={collateralBalance}
            borrowCapacity={borrowCapacity}
            validationStatus={inputData.validationStatus}
          />

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
              useMaxHandler: () => useMaxHandler(userCollateralBalance),
              inputStatus: inputData.validationStatus,
              convertedValue: inputAmount * (collateralRate ?? 1),
              inputSize: INPUT_LARGE,
              validationFns: [[validateInputLength, ERR_MSG_INPUT]],
            }}
          >
            <InputPinnedTokenInfo>
              <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
            </InputPinnedTokenInfo>
          </Input>

          <XTZLimitInfoBanner show={willExceedXTZTheLimit} spaces="mt-20 mb-20" />

          <div className="block-name">New Vault Status</div>

          <AddCollateralTableStats
            collateralRatio={futureCollateralRatio}
            collateralBalance={futureCollateralBalance}
            borrowCapacity={futureBorrowCapacity}
            validationStatus={inputData.validationStatus}
          />

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

const AddCollateralTableStats = ({
  collateralRatio,
  collateralBalance,
  borrowCapacity,
  validationStatus,
}: {
  collateralRatio: number
  collateralBalance: number
  borrowCapacity: number
  validationStatus: InputStatusType
}) => {
  return (
    <MemoizedComponent returnMemoizedComponent={validationStatus === INPUT_STATUS_ERROR}>
      <VaultModalOverview>
        <ThreeLevelListItem className="collateral-diagram" customColor={getCollateralRationPersent(collateralRatio)}>
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
            Available to Borrow{' '}
            <CustomTooltip
              text="The available to borrow metric takes 2 separate values into account. The borrow capacity of your vault AND the availableLiquidity of the asset pool your vault is borrowing from. The equation used is: min(availableLiquidityuidity, vaultCollateralValue / 2 - borrowedAmount)"
              iconId="info"
              defaultStrokeColor={silverColor}
            />
          </div>
          <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
        </ThreeLevelListItem>
      </VaultModalOverview>
    </MemoizedComponent>
  )
}
