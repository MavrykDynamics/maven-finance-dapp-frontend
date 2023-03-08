import { useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'
import { State } from 'reducers'
import { useDispatch, useSelector } from 'react-redux'

import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { INPUT_LARGE, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import {
  AddCollateralPopupDataType,
  DEFAULT_LOANS_INPUT_VALUE,
  getOnBlurValue,
  getOnFocusValue,
} from './Modals.helpers'

import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'

import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { depositCollateralAction } from 'pages/Loans/Actions/vaultCollateral.actions'
import { calcCollateralRatio, getMaxCollateralWithdraw } from 'pages/Loans/Loans.helpers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

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
  const {
    selectedAsset,
    vaultCollateralBalance = 0,
    vaultAddress,
    currentCollateralRatio = 0,
    borrowedAmount = 0,
    borrowedAssetRate = 0,
    currentCollateralBalance = 0,
  } = data ?? {}

  useLockBodyScroll(show)

  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)

  const collateralData = useMemo(
    () => avaliableCollaterals.find(({ gqlName }) => selectedAsset?.gqlName === gqlName),
    [avaliableCollaterals, selectedAsset],
  )

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)
  const collateralRate = Number(selectedAsset?.rate)

  const { futureCollateralRatio, futureCollateralWithdraw, futureCollateralBalance, currentCollateralToWithdraw } =
    useMemo(() => {
      const futureCollateralRatio = selectedAsset
        ? calcCollateralRatio(vaultCollateralBalance + inputAmount * collateralRate, borrowedAmount, borrowedAssetRate)
        : 0

      const currentCollateralToWithdraw = getMaxCollateralWithdraw(
        currentCollateralBalance * collateralRate,
        vaultCollateralBalance,
        borrowedAmount,
        borrowedAssetRate,
        collateralRate,
      )

      const futureCollateralWithdraw = currentCollateralToWithdraw * collateralRate + inputAmount * collateralRate

      const futureCollateralBalance = vaultCollateralBalance + inputAmount * collateralRate
      return { futureCollateralRatio, futureCollateralWithdraw, futureCollateralBalance, currentCollateralToWithdraw }
    }, [
      selectedAsset,
      vaultCollateralBalance,
      inputAmount,
      borrowedAmount,
      borrowedAssetRate,
      currentCollateralBalance,
      collateralRate,
    ])

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
    }
  }, [show])

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= maxAmount ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

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

  const depositCollateralHandler = async () => {
    if (collateralData) {
      const collaretalToDeposit = {
        collateralName: collateralData.gqlName,
        assetId: collateralData.id,
        tokenType: collateralData.tokenType,
        amount: Math.floor(Number(inputData.amount) * 10 ** collateralData.decimals),
        assetAddress: collateralData.address,
      }

      if (vaultAddress) {
        await dispatch(depositCollateralAction(vaultAddress, collaretalToDeposit, closePopup))
      }
    }
  }

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
              customColor={getCollateralRationPersent(currentCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  beginningText={`${currentCollateralRatio > 250 ? '+' : ''}`}
                  value={Math.max(0, Math.min(currentCollateralRatio, 250))}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((currentCollateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={vaultCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={currentCollateralToWithdraw * collateralRate} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <hr />

          <Input
            className={`${collateralData?.rate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onFocus: onFocusHandler,
              onBlur: inputOnBlurHandle,
              onChange: (e) => inputOnChangeHandle(e.target.value, collateralData?.userBalance ?? 0),
            }}
            settings={{
              balance: collateralData?.userBalance ?? 0,
              balanceAsset: selectedAsset?.symbol,
              useMaxHandler: () =>
                inputOnChangeHandle(String(collateralData?.userBalance ?? 0), collateralData?.userBalance ?? 0),
              inputStatus: inputData.validationStatus,
              convertedValue: inputAmount * (collateralData?.rate ?? 1),
              inputSize: INPUT_LARGE,
            }}
          >
            <InputPinnedTokenInfo>
              <ImageWithPlug imageLink={collateralData?.icon} alt={`${collateralData?.symbol} icon`} />{' '}
              {selectedAsset?.symbol}
            </InputPinnedTokenInfo>
          </Input>

          <div className="block-name">New Vault Status</div>
          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(futureCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  beginningText={`${futureCollateralRatio > 250 ? '+' : ''}`}
                  value={Math.max(0, Math.min(futureCollateralRatio, 250))}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((futureCollateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={futureCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={futureCollateralWithdraw} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <div className="manage-btn">
            <NewButton
              kind={BUTTON_PRIMARY}
              onClick={depositCollateralHandler}
              form={BUTTON_WIDE}
              disabled={inputData.validationStatus === INPUT_STATUS_ERROR || isActionLoading}
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
