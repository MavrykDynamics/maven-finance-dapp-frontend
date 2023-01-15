import { useEffect, useMemo, useState } from 'react'

import { ACTION_PRIMARY, ACTION_SIMPLE, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { DropDownJsxChild, LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { DropDown, DropdownInputCustomChild, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { silverColor } from 'styles'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { depositCollateralAction } from 'pages/Loans/Loans.actions'
import { SimpleCircleSpinnerLoader } from 'app/App.components/Loader/Loader.view'

type DropDownCollateralAssetType = DropDownItemType & {
  assetName: string
  assetSymbol: string
  userBalance: number
  assetIcon: string
  assetRate: number | null
}

type DropDownXTZBakerType = DropDownItemType & {
  bakerName: string
}

const MOCKED_BAKERS_DROPDOWN = [
  {
    content: (
      <DropDownJsxChild>
        <div className="flex-row with-image">
          <Icon id="noImage" /> 1111
        </div>
        <div className="baker-fee">
          <CommaNumber value={3.32} endingText="%" />
        </div>
      </DropDownJsxChild>
    ),
    bakerName: '1111',
    id: 1,
  },
  {
    content: (
      <DropDownJsxChild>
        <div className="flex-row with-image">
          <Icon id="noImage" /> 22222
        </div>
        <div className="baker-fee">
          <CommaNumber value={3.32} endingText="%" />
        </div>
      </DropDownJsxChild>
    ),
    bakerName: '2222',
    id: 2,
  },
  {
    content: (
      <DropDownJsxChild>
        <div className="flex-row with-image">
          <Icon id="noImage" /> 33333
        </div>
        <div className="baker-fee">
          <CommaNumber value={3.32} endingText="%" />
        </div>
      </DropDownJsxChild>
    ),
    bakerName: '3333',
    id: 3,
  },
]

const INITIAL_SCREEN_ID = 'initial'
const ADD_COLLATERAL_SCREEN_ID = 'addCollateral'
const CONFIRMATION_SCREEN_ID = 'confirmation'
type CurrentActiveModalScreen =
  | typeof INITIAL_SCREEN_ID
  | typeof ADD_COLLATERAL_SCREEN_ID
  | typeof CONFIRMATION_SCREEN_ID

type InputCollateral = {
  id: number
  inputAmount: string
  validationField: InputStatusType
}

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17480%3A229353&t=Sx2aEpp3ifrGxBtQ-0
export const CreateNewVault = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const { avaliableCollaterals } = useSelector((state: State) => state.loans)
  const [shownScreen, setShownScreen] = useState<CurrentActiveModalScreen>(INITIAL_SCREEN_ID)
  const [collateralsToSelect, setCollateralsToSelect] = useState<Array<DropDownCollateralAssetType>>([])
  const [collaterals, setCollaterals] = useState<Array<InputCollateral>>([])
  const [isVaultCreating, setVaultCreating] = useState(false)

  useEffect(() => {
    const mappedAvaliableCollaterals = avaliableCollaterals.map((collateralData, idx) => ({
      ...collateralData,
      content: <DropdownInputCustomChild iconSrc={collateralData.assetIcon} symbol={collateralData.assetName} />,
      disabled: idx === 0,
    }))

    setCollateralsToSelect(mappedAvaliableCollaterals)
    setCollaterals([
      {
        id: mappedAvaliableCollaterals[0].id,
        inputAmount: '0',
        validationField: '',
      },
    ])
  }, [avaliableCollaterals])

  // Data for 3rd screen, in case we have only 1 collateral to add
  const firstCollateralMetadata = useMemo(() => collateralsToSelect.find(({ id }) => collaterals?.[0]?.id === id), [])

  const isAddCollateralContinueDisabled = useMemo(() => {
    const needBakerForXTZ = collaterals.find(
      ({ id }) =>
        collateralsToSelect
          .find(({ id: collateralToSelectId }) => id === collateralToSelectId)
          ?.assetName?.toLowerCase() === 'xtz',
    )
    // Continue button to confirmation is disabled when:
    return Boolean(
      // async operation of creating vault instance on backend is not finished
      isVaultCreating ||
        // when we have invalid data in some inputs
        !collaterals.every(({ validationField }) => validationField === INPUT_STATUS_SUCCESS) ||
        // when we have selected xtz collateral and we haven't selected a baker for it
        (needBakerForXTZ && bakerChosenDdItem),
    )
  }, [])

  // select baker for an xtz collateral, used only when we selected one collateral XTZ
  const bakerItemsForDropDown = useMemo<DropDownXTZBakerType[]>(() => MOCKED_BAKERS_DROPDOWN, [])
  const [bakerChosenDdItem, setAssetChosenDdItem] = useState<DropDownXTZBakerType | undefined>()
  const handleOnClickDropdownBakerItem = (itemId: number) =>
    setAssetChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))

  // stuff to handle add collateral btn
  const nextAvaliableCollateralToAdd = useMemo(
    () => collateralsToSelect.find(({ disabled }) => disabled === false),
    [collateralsToSelect],
  )

  const addNewCollateralHandler = () => {
    if (nextAvaliableCollateralToAdd) {
      setCollaterals(
        collaterals.concat([
          {
            id: nextAvaliableCollateralToAdd.id,
            inputAmount: '0',
            validationField: '',
          },
        ]),
      )

      setCollateralsToSelect(
        collateralsToSelect.map((collateral) =>
          collateral.id === nextAvaliableCollateralToAdd?.id
            ? {
                ...collateral,
                disabled: true,
              }
            : collateral,
        ),
      )
    }
  }

  // stuff to handle collateral input dropdown
  const handleCollateralInputDdClick = (collateralIdx: number, listItemId: number, currentInputId: number) => {
    const selectedItem = collateralsToSelect.find(({ id }) => id === listItemId)

    if (!selectedItem) return

    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== collateralIdx
          ? collateral
          : {
              ...collateral,
              name: String(selectedItem?.assetName),
              id: selectedItem?.id,
            },
      ),
    )

    setCollateralsToSelect(
      collateralsToSelect.map((collateral) => {
        if (collateral.id === selectedItem?.id) {
          return {
            ...collateral,
            disabled: true,
          }
        }

        if (collateral.id === currentInputId) {
          return {
            ...collateral,
            disabled: false,
          }
        }

        return collateral
      }),
    )
  }

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, inputIdx: number) => {
    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== inputIdx
          ? collateral
          : {
              ...collateral,
              inputAmount: newInputAmount,
            },
      ),
    )
  }

  const inputOnBlurHandle = (newInputAmount: string, inputIdx: number, userAssetBalance: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= userAssetBalance
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== inputIdx
          ? collateral
          : {
              ...collateral,
              validationField: validationStatus,
            },
      ),
    )
  }

  const createVaultAction = async () => {
    setVaultCreating(true)

    setTimeout(() => {
      setVaultCreating(false)
    }, 2000)
  }

  const titleText =
    shownScreen === 'initial'
      ? 'Create New Vault'
      : shownScreen === 'addCollateral'
      ? 'Select Collateral For Vault'
      : 'Confirm Collateral Deposit'

  const descrText =
    shownScreen === 'initial'
      ? `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
  auctor id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et ligula
  fringilla, tempus sapien eget, pellentesque orci. Donec finibus quam rhoncus, fringilla ex ut, feugiat
  nulla. Curabitur tristique augue non ante hendrerit ultrices`
      : shownScreen === 'addCollateral'
      ? `Select an one or multiple assets to add as collateral. If you are providing XTZ as collateral, make sure you
      select a baker.`
      : `Please confirm the following details.`

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>{titleText}</h2>
          </GovRightContainerTitleArea>
          <div
            className="modalDescr"
            style={{
              ...(shownScreen === 'addCollateral' ? { marginBottom: '50px' } : {}),
            }}
          >
            {descrText}
          </div>

          {/* showing initial screen */}
          {shownScreen === 'initial' ? (
            <>
              <NewButton
                kind={ACTION_PRIMARY}
                onClick={() => {
                  setShownScreen(ADD_COLLATERAL_SCREEN_ID)
                  createVaultAction()
                }}
                className="modal-manage-btn"
              >
                Continue
                <Icon id="arrowRight" />
              </NewButton>
            </>
          ) : null}

          {/* showing add collateral screen */}
          {shownScreen === 'addCollateral' ? (
            <>
              <div className="collateral-list">
                {collaterals.map(({ inputAmount, validationField, id: inputCollateralId }, idx) => {
                  const collaterallMetadata = collateralsToSelect?.find(({ id }) => id === inputCollateralId)
                  if (!collaterallMetadata) return null
                  const isXTZCollateral = collaterallMetadata?.assetName.toLocaleLowerCase() === 'xtz'

                  return (
                    <div className="collateral-block" key={inputCollateralId}>
                      <div className="block-name">Select Collateral Asset and Amount</div>
                      <Input
                        className={`${
                          collaterallMetadata.assetRate ? 'input-with-rate' : ''
                        } large-input pinned-dropdown`}
                        inputProps={{
                          value: inputAmount,
                          type: 'number',
                          onChange: (e) => inputOnChangeHandle(e.target.value, idx),
                          onBlur: (e) => inputOnBlurHandle(e.target.value, idx, collaterallMetadata.userBalance),
                        }}
                        settings={{
                          balanceAsset: collaterallMetadata.assetName,
                          useMaxHandler: () => {
                            inputOnChangeHandle(String(collaterallMetadata.userBalance), idx)
                            inputOnBlurHandle(
                              String(collaterallMetadata.userBalance),
                              idx,
                              collaterallMetadata.userBalance,
                            )
                          },
                          inputStatus: validationField,
                          ...(collaterallMetadata.assetRate
                            ? { convertedValue: Number(collaterallMetadata.assetRate) * Number(inputAmount) }
                            : {}),
                          balance: collaterallMetadata.userBalance,
                        }}
                      >
                        <InputPinnedDropDown>
                          <DropDown
                            placeholder=""
                            activeItem={{
                              content: (
                                <DropdownInputCustomChild
                                  iconSrc={collaterallMetadata.assetIcon}
                                  symbol={collaterallMetadata.assetName}
                                />
                              ),
                              id: inputCollateralId,
                            }}
                            items={collateralsToSelect}
                            clickItem={(itemId: number) => handleCollateralInputDdClick(idx, itemId, inputCollateralId)}
                            className="input-dropdown"
                          />
                        </InputPinnedDropDown>
                      </Input>

                      {isXTZCollateral ? (
                        <>
                          <div className="block-name" style={{ marginTop: '40px' }}>
                            Select Baker
                          </div>
                          <DropDown
                            placeholder="Select Bakery"
                            activeItem={bakerChosenDdItem}
                            items={bakerItemsForDropDown}
                            clickItem={handleOnClickDropdownBakerItem}
                          />
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <NewButton
                kind={ACTION_SIMPLE}
                disabled={!Boolean(nextAvaliableCollateralToAdd)}
                onClick={addNewCollateralHandler}
                className="add-collateral-inline"
              >
                + Add more assets as collateral
              </NewButton>

              <NewButton
                kind={ACTION_PRIMARY}
                onClick={() => setShownScreen(CONFIRMATION_SCREEN_ID)}
                className="modal-manage-btn"
                disabled={isAddCollateralContinueDisabled}
              >
                Continue
                <Icon id="arrowRight" />
              </NewButton>

              {isVaultCreating ? (
                <div className="creating-vault-loader-wrapper">
                  Creating Vault
                  <SimpleCircleSpinnerLoader />
                </div>
              ) : null}
            </>
          ) : null}

          {/* showing confirmation screen */}
          {shownScreen === 'confirmation' ? (
            <>
              {collaterals.length === 1 ? (
                <div className="lending-stats" style={{ marginBottom: '30px' }}>
                  <ThreeLevelListItem>
                    <div className="name">Asset</div>
                    <div className="value">{firstCollateralMetadata?.assetName}</div>
                    <CommaNumber value={2412} className="value" endingText="mXTZ" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Amount</div>
                    <CommaNumber value={Number(collaterals[0].inputAmount)} className="value" endingText="%" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">USD Value</div>
                    {firstCollateralMetadata?.assetRate ? (
                      <CommaNumber
                        value={Number(collaterals[0].inputAmount) * Number(firstCollateralMetadata?.assetRate)}
                        className="value"
                        beginningText="$"
                      />
                    ) : (
                      <div className="value">-</div>
                    )}
                  </ThreeLevelListItem>
                </div>
              ) : (
                <Table className="treasury-table">
                  <TableHeader className="treasury">
                    <TableRow>
                      <TableHeaderCell>Asset</TableHeaderCell>
                      <TableHeaderCell>Amount</TableHeaderCell>
                      <TableHeaderCell className="right">USD Value</TableHeaderCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="treasury">
                    {collaterals.map(({ inputAmount, id: collateralId }) => {
                      const collateralMetadata = collateralsToSelect.find(({ id }) => id === collateralId)
                      if (!collateralMetadata) return null

                      return (
                        <TableRow rowHeight={40} borderColor="dataColor" className="add-hover">
                          <TableCell width="42%">{collateralMetadata.assetName}</TableCell>
                          <TableCell width="28%">
                            <CommaNumber value={Number(inputAmount)} />
                          </TableCell>
                          <TableCell className="right" width="28%">
                            {collateralMetadata?.assetRate ? (
                              <CommaNumber
                                value={Number(inputAmount) * Number(collateralMetadata?.assetRate)}
                                className="value"
                                beginningText="$"
                              />
                            ) : (
                              <div className="value">-</div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              <div className="lending-stats" style={{ marginTop: '20px', justifyContent: 'space-around' }}>
                {bakerChosenDdItem ? (
                  <ThreeLevelListItem>
                    <div className="name">Selected Baker</div>
                    <div className="value">{bakerChosenDdItem.bakerName}</div>
                  </ThreeLevelListItem>
                ) : null}

                <ThreeLevelListItem>
                  <div className="name">
                    Borrowing Capacity{' '}
                    <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text="" className="tooltip" />
                  </div>
                  <CommaNumber value={0} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </div>
              <div className="buttons-wrapper" style={{ marginTop: '30px' }}>
                <NewButton
                  kind={TRANSPARENT_WITH_BORDER}
                  onClick={() => setShownScreen(ADD_COLLATERAL_SCREEN_ID)}
                  className="modal-manage-btn"
                >
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton kind={ACTION_PRIMARY} onClick={depositCollateralAction} className="modal-manage-btn">
                  <Icon id="Plus" />
                  Deposit
                </NewButton>
              </div>
            </>
          ) : null}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
