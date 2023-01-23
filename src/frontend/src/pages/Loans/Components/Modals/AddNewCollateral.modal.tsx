import { useEffect, useMemo, useState } from 'react'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DropDown, DropdownInputCustomChild } from 'app/App.components/DropDown/NewDropdown'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Input } from 'app/App.components/Input/NewInput'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { DropDownJsxChild, LoansModalBase, VaultModalOverview } from './Modals.style'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { depositCollateralAction } from 'pages/Loans/Loans.actions'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { DropDownCollateralAssetType, DropDownXTZBakerType } from './CreateNewVault.modal'
import { getAssetName, isTezosAsset } from 'pages/Loans/Loans.helpers'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239633&t=Sx2aEpp3ifrGxBtQ-0
export const AddNewCollateral = ({
  closePopup,
  show,
  data: { vaultAddress, currentCollateralValue, currentAvaliableToWithdraw },
}: {
  closePopup: () => void
  show: boolean
  data: { vaultAddress: string; currentCollateralValue: number; currentAvaliableToWithdraw: number }
}) => {
  const dispatch = useDispatch()

  const [inputData, setInputData] = useState<
    | {
        amount: string
        assetName: string
        userBalance: number
        id: number
        validationStatus: InputStatusType
        ddItems: Record<number, DropDownCollateralAssetType>
        selectedDdItem: DropDownCollateralAssetType
      }
    | undefined
  >()
  const { avaliableCollaterals, xtzBakers } = useSelector((state: State) => state.loans)

  // select baker for an xtz collateral, used only when we selected one collateral XTZ
  const bakerItemsForDropDown = useMemo<DropDownXTZBakerType[]>(
    () =>
      xtzBakers.map(({ name, fee, logo, address, yield: bakerYield, freespace }, idx) => ({
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              {logo ? (
                <div className="image-wrapper">
                  <img src={logo} alt={name + '-logo'} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}{' '}
              {name}
            </div>
            <div className="baker-fee">
              <CommaNumber value={fee} endingText="%" />
            </div>
          </DropDownJsxChild>
        ),
        bakerName: name,
        id: idx,
        bakerAddress: address,
        bakerYield,
        bakerFreeSpace: freespace,
      })),
    [xtzBakers],
  )
  const [bakerChosenDdItem, setAssetChosenDdItem] = useState<DropDownXTZBakerType | undefined>()
  const showBakerAddress = useMemo(() => isTezosAsset(inputData?.assetName ?? ''), [inputData])
  const handleOnClickDropdownBakerItem = (itemId: number) =>
    setAssetChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))

  const [isDepositting, setIsDepositting] = useState(false)
  const isDepositBtnDisabled = useMemo(
    () =>
      isDepositting ||
      (isTezosAsset(inputData?.assetName ?? '') && !bakerChosenDdItem) ||
      inputData?.validationStatus === INPUT_STATUS_ERROR,
    [bakerChosenDdItem, inputData?.assetName, inputData?.validationStatus, isDepositting],
  )

  useEffect(() => {
    const mappedAvaliableCollaterals = avaliableCollaterals.reduce<Record<number, DropDownCollateralAssetType>>(
      (acc, collateralData) => {
        acc[collateralData.id] = {
          ...collateralData,
          content: (
            <DropdownInputCustomChild
              iconSrc={collateralData.assetIcon}
              symbol={getAssetName(collateralData.assetName)}
            />
          ),
          disabled: collateralData.isProtected,
        }
        return acc
      },
      {},
    )
    mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])].disabled = true

    setInputData({
      amount: '0',
      assetName: mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])].assetName,
      userBalance: mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])].userBalance,
      validationStatus: '',
      id: mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])].id,
      ddItems: mappedAvaliableCollaterals,
      selectedDdItem: mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])],
    })

    if (!show) {
      setInputData(undefined)
    }
  }, [avaliableCollaterals, show])

  const depositCollateralHandler = () => {
    if (inputData) {
      const collaretalToDeposit = [
        {
          collateralName: inputData.assetName,
          assetId: inputData.selectedDdItem.id,
          tokenType: inputData.selectedDdItem.tokenType,
          amount: Math.floor(Number(inputData.amount) * 10 ** inputData.selectedDdItem.assetDecimals),
          assetAddress: inputData.selectedDdItem.assetAddress,
        },
      ]

      if (vaultAddress) {
        setIsDepositting(true)
        dispatch(
          depositCollateralAction(vaultAddress, collaretalToDeposit, closePopup, bakerChosenDdItem?.bakerAddress),
        )
        setIsDepositting(false)
      }
    }
  }

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

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Add More Assets As Collateral</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select an assets to add as collateral to an existing vault.</div>

          <VaultModalOverview style={{ marginBottom: '45px' }}>
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
              <CommaNumber value={currentCollateralValue} beginningText="$" className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={currentAvaliableToWithdraw} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          {inputData ? (
            <>
              <Input
                className={`${
                  inputData.selectedDdItem?.assetRate ? 'input-with-rate' : ''
                } large-input pinned-dropdown withdrawCollateralInput`}
                inputProps={{
                  value: inputData?.amount,
                  type: 'number',
                  onBlur: inputOnBlurHandle,
                  onFocus: onFocusHandler,
                  onChange: (e) => inputOnChangeHandle(e.target.value, inputData.userBalance),
                }}
                settings={{
                  balance: inputData.userBalance,
                  balanceAsset: getAssetName(inputData.assetName),
                  useMaxHandler: () =>
                    setInputData({
                      ...inputData,
                      amount: String(inputData.userBalance),
                      validationStatus: INPUT_STATUS_SUCCESS,
                    }),
                  inputStatus: inputData.validationStatus,
                  convertedValue: Number(inputData.amount) * inputData.selectedDdItem.assetRate,
                }}
              >
                <InputPinnedDropDown>
                  <DropDown
                    placeholder="Select Bakery"
                    activeItem={inputData.selectedDdItem}
                    items={Object.values(inputData.ddItems)}
                    clickItem={(id: number) => {
                      const newDDItems = {
                        ...inputData.ddItems,
                        [inputData.id]: {
                          ...inputData.ddItems[inputData.id],
                          disabled: false,
                        },
                        [id]: {
                          ...inputData.ddItems[id],
                          disabled: true,
                        },
                      }
                      setInputData({
                        ...inputData,
                        assetName: inputData.ddItems[id].assetName,
                        selectedDdItem: inputData.ddItems[id],
                        ddItems: newDDItems,
                        id,
                      })
                    }}
                    className="input-dropdown"
                  />
                </InputPinnedDropDown>
              </Input>

              {showBakerAddress ? (
                <>
                  <div className="block-name">Select Baker</div>
                  <DropDown
                    placeholder="Select Bakery"
                    activeItem={bakerChosenDdItem}
                    items={bakerItemsForDropDown}
                    clickItem={handleOnClickDropdownBakerItem}
                  />
                  <div className="lending-stats" style={{ margin: '30px 0' }}>
                    <ThreeLevelListItem>
                      <div className="name">Bakery Address</div>
                      {bakerChosenDdItem?.bakerAddress ? (
                        <TzAddress className="value" tzAddress={bakerChosenDdItem.bakerAddress} type={BLUE} />
                      ) : (
                        <div className="value">-</div>
                      )}
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Yield</div>
                      {bakerChosenDdItem?.bakerYield ? (
                        <CommaNumber value={bakerChosenDdItem.bakerYield} className="value" endingText="%" />
                      ) : (
                        <div className="value">-</div>
                      )}
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Free Capacity</div>
                      {bakerChosenDdItem?.bakerFreeSpace ? (
                        <CommaNumber value={bakerChosenDdItem.bakerFreeSpace} className="value" endingText="XTZ" />
                      ) : (
                        <div className="value">-</div>
                      )}
                    </ThreeLevelListItem>
                  </div>
                </>
              ) : null}
            </>
          ) : null}

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
              <CommaNumber value={0} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={0} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <NewButton
            kind={ACTION_PRIMARY}
            onClick={depositCollateralHandler}
            className="modal-manage-btn"
            disabled={isDepositBtnDisabled}
          >
            <Icon id="plus" />
            Deposit
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
