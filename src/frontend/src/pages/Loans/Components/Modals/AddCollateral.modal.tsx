import { useMemo, useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { getAssetName, isTezosAsset } from 'pages/Loans/Loans.helpers'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { depositCollateralAction } from 'pages/Loans/Loans.actions'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239476&t=Sx2aEpp3ifrGxBtQ-0
export const AddCollateral = ({
  closePopup,
  show,
  data: { selectedAsset, currentCollateralValue, currentAvaliableToWithdraw, vaultAddress },
}: {
  closePopup: () => void
  show: boolean
  data: {
    vaultAddress: string
    currentCollateralValue: number
    currentAvaliableToWithdraw: number
    selectedAsset?: BorrowingData['collateralData'][number]
  }
}) => {
  const dispatch = useDispatch()
  const { avaliableCollaterals } = useSelector((state: State) => state.loans)
  const collateralData = useMemo(
    () => avaliableCollaterals.find(({ assetSymbol }) => selectedAsset?.assetSymbol === assetSymbol),
    [avaliableCollaterals, selectedAsset],
  )

  const [inputData, setInputData] = useState<{ amount: string; validationStatus: InputStatusType }>({
    amount: '0',
    validationStatus: '',
  })

  const [isDepositting, setIsDepositting] = useState(false)
  const isDepositBtnDisabled = useMemo(
    () => isDepositting || inputData?.validationStatus === INPUT_STATUS_ERROR,
    [inputData?.validationStatus, isDepositting],
  )

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, userAssetBalance: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= userAssetBalance
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && newInputAmount !== '' && newInputAmount !== '0') return

    if (inputData) {
      setInputData({
        ...inputData,
        amount: newInputAmount,
        validationStatus: validationStatus,
      })
    }
  }

  const inputOnBlurHandle = () => {
    if (inputData) {
      setInputData({
        ...inputData,
        amount: (inputData?.amount === '' ? '0' : inputData?.amount) ?? '',
      })
    }
  }

  const onFocusHandler = () => {
    if (inputData) {
      setInputData({
        ...inputData,
        amount: (inputData?.amount === '0' ? '' : inputData?.amount) ?? '',
      })
    }
  }

  const depositCollateralHandler = () => {
    if (collateralData) {
      const collaretalToDeposit = [
        {
          collateralName: collateralData.assetName,
          assetId: collateralData.id,
          tokenType: collateralData.tokenType,
          amount: Math.floor(Number(inputData.amount) * 10 ** collateralData.assetDecimals),
          assetAddress: collateralData.assetAddress,
        },
      ]

      if (vaultAddress) {
        setIsDepositting(true)
        dispatch(
          depositCollateralAction(vaultAddress, collaretalToDeposit, closePopup),
          // depositCollateralAction(vaultAddress, collaretalToDeposit, closePopup, bakerChosenDdItem?.bakerAddress),
        )
        setIsDepositting(false)
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
            <ThreeLevelListItem className="collateral-diagram">
              <div className={`percentage ${Number(154) / 100 > 2.5 ? 'up' : 'down'}`}>
                Collateral Ratio: <CommaNumber value={154} endingText="%" />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={50}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={currentCollateralValue} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={currentAvaliableToWithdraw} className="value" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <hr />

          <Input
            className={`${
              collateralData?.assetRate ? 'input-with-rate' : ''
            } large-input pinned-dropdown withdrawCollateralInput`}
            inputProps={{
              value: inputData.amount,
              type: 'number',
              onFocus: onFocusHandler,
              onBlur: inputOnBlurHandle,
              onChange: (e) => inputOnChangeHandle(e.target.value, collateralData?.userBalance ?? 0),
            }}
            settings={{
              balance: collateralData?.userBalance ?? 0,
              balanceAsset: getAssetName(collateralData?.assetName ?? ''),
              useMaxHandler: () =>
                inputOnChangeHandle(
                  collateralData?.userBalance ? String(collateralData.userBalance) : '0',
                  collateralData?.userBalance ?? 0,
                ),
              inputStatus: inputData.validationStatus,
              convertedValue: Number(inputData.amount) * (collateralData?.assetRate ?? 1),
            }}
          >
            <InputPinnedTokenInfo>
              {collateralData?.assetIcon ? (
                <div className="image-wrapper">
                  <img src={collateralData.assetIcon} alt={collateralData.assetName + '-logo'} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}{' '}
              {getAssetName(collateralData?.assetName ?? '')}
            </InputPinnedTokenInfo>
          </Input>

          <div className="block-name">New Vault Status</div>
          <VaultModalOverview>
            <ThreeLevelListItem className="collateral-diagram">
              <div className={`percentage ${Number(154) / 100 > 2.5 ? 'up' : 'down'}`}>
                Collateral Ratio: <CommaNumber value={154} endingText="%" />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={50}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={0} className="value" />
              {false ? <CommaNumber value={0} beginningText="$" className="rate" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={0} className="value" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <NewButton
            kind={ACTION_PRIMARY}
            onClick={depositCollateralHandler}
            disabled={isDepositBtnDisabled}
            className="modal-manage-btn"
          >
            <Icon id="plus" />
            Deposit
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
