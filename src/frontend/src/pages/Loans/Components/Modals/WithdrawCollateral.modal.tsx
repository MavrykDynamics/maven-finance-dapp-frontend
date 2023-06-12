import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import {
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { State } from 'reducers'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_LOANS_INPUT_VALUE,
  WithdrawCollateralPopupDataType,
} from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { withdrawCollateralAction } from 'pages/Loans/Actions/vaultCollateral.actions'

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
  calcCollateralRatio,
  getCollateralRatioByPersentage,
  getLoansInputMaxAmount,
  getMaxCollateralWithdraw,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'
import { checkNan } from 'utils/checkNan'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { checkWhetherTokenIsCollateralToken } from 'providers/TokensProvider/helpers/tokens.utils'

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
  const {
    tokenAddress = '',
    borrowedAssetRate = 0,
    currentCollateralBalance = 0,
    vaultCollateralBalance = 0,
    vaultAddress,
    currentCollateralRatio = 0,
    borrowedAmount = 0,
  } = data ?? {}

  const { tokensMetadata, tokensPrices } = useTokensContext()

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { userTokens } = useSelector((state: State) => state.wallet.user)

  // TODO: use users balance
  const collateralBalance = 0 //userTokens[balanceSymbol]?.balance ?? 0

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const inputAmount = checkNan(parseFloat(inputData.amount))

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
    }
  }, [show])

  const collateralData = tokensMetadata[tokenAddress]

  if (!data || !checkWhetherTokenIsCollateralToken(collateralData)) return null

  const collateralRate = tokensPrices[collateralData.symbol]

  const futureCollateralRatio = calcCollateralRatio(
    vaultCollateralBalance - inputAmount * collateralRate,
    borrowedAmount,
    borrowedAssetRate,
  )

  const currentCollateralToWithdraw = getMaxCollateralWithdraw(
    currentCollateralBalance,
    vaultCollateralBalance,
    borrowedAmount,
    borrowedAssetRate,
    collateralRate,
  )

  const futureCollateralWithdraw = currentCollateralToWithdraw - inputAmount
  const futureVaultCollateralBalance = vaultCollateralBalance - inputAmount * collateralRate

  const isActionBtnDisabled =
    isActionActive || inputData.validationStatus !== INPUT_STATUS_SUCCESS || futureCollateralRatio <= 200

  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount,
      options: {
        byDecimalPlaces: collateralData?.decimals || assetDecimalsToShow,
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

  const withdrawHandler = () => {
    if (vaultAddress) {
      dispatch(withdrawCollateralAction(Number(inputData.amount), collateralData, vaultAddress, closePopup))
    }
  }

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
              customColor={getCollateralRationPersent(currentCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber value={currentCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={getCollateralRatioByPersentage(currentCollateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={vaultCollateralBalance} className="value" beginningText="$" />
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
          {collateralData ? (
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
                balance: collateralBalance,
                balanceAsset: collateralData.name,
                useMaxHandler: () =>
                  inputOnChangeHandle(
                    getLoansInputMaxAmount(currentCollateralToWithdraw, collateralData.decimals),
                    currentCollateralToWithdraw,
                  ),
                inputStatus: inputData.validationStatus,
                convertedValue: inputAmount * collateralRate,
                inputSize: INPUT_LARGE,
              }}
            >
              <InputPinnedTokenInfo>
                <ImageWithPlug imageLink={collateralData.icon} alt={`${collateralData.name} icon`} />{' '}
                {collateralData.name}
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
