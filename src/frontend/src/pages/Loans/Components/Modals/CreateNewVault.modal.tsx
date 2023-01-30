import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { depositCollateralAction, triggerInitialVaultCreation } from 'pages/Loans/Loans.actions'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { CreateVaultPopupDataType } from './Modals.helpers'
import { isTezosAsset } from 'pages/Loans/Loans.helpers'
import { AvaliableCollateralType } from 'utils/TypesAndInterfaces/Loans'
import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SimpleCircleSpinnerLoader } from 'app/App.components/Loader/Loader.view'
import { DropDown, DropdownInputCustomChild, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import { Input } from 'app/App.components/Input/NewInput'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { DropDownJsxChild, LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { State } from 'reducers'
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

export type DropDownCollateralAssetType = DropDownItemType & AvaliableCollateralType

export type DropDownXTZBakerType = DropDownItemType & {
  bakerName: string
  bakerAddress: string
  bakerYield: number
  bakerFreeSpace: number
}

type CurrentActiveModalScreen =
  | typeof INITIAL_SCREEN_ID
  | typeof ADD_COLLATERAL_SCREEN_ID
  | typeof CONFIRMATION_SCREEN_ID

type InputCollateral = {
  id: number
  inputAmount: string
  validationField: InputStatusType
}

const INITIAL_SCREEN_ID = 'initial'
const ADD_COLLATERAL_SCREEN_ID = 'addCollateral'
const CONFIRMATION_SCREEN_ID = 'confirmation'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17480%3A229353&t=Sx2aEpp3ifrGxBtQ-0
export const CreateNewVault = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: CreateVaultPopupDataType
}) => {
  const { currentMarketAsset } = data ?? {}
  const dispatch = useDispatch()
  const { xtzBakers } = useSelector((state: State) => state.loans)
  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const [shownScreen, setShownScreen] = useState<CurrentActiveModalScreen>(INITIAL_SCREEN_ID)
  const [collateralsToSelect, setCollateralsToSelect] = useState<Record<number, DropDownCollateralAssetType>>({})
  const [collaterals, setCollaterals] = useState<Array<InputCollateral>>([])
  const [isVaultCreating, setVaultCreating] = useState(false)
  const [newVaultAddress, setNewVaultAddress] = useState('')

  useLockBodyScroll(show)

  useEffect(() => {
    if (!avaliableCollaterals.length) return

    const mappedAvaliableCollaterals = avaliableCollaterals.reduce<Record<number, DropDownCollateralAssetType>>(
      (acc, collateralData) => {
        acc[collateralData.id] = {
          ...collateralData,
          content: <DropdownInputCustomChild iconSrc={collateralData.assetIcon} symbol={collateralData.assetName} />,
          disabled: collateralData.isProtected,
        }
        return acc
      },
      {},
    )
    mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])].disabled = true

    setCollateralsToSelect(mappedAvaliableCollaterals)
    setCollaterals([
      {
        id: mappedAvaliableCollaterals[Number(Object.keys(mappedAvaliableCollaterals)[0])].id,
        inputAmount: '0',
        validationField: '',
      },
    ])

    if (!show) {
      setShownScreen(INITIAL_SCREEN_ID)
      setAssetChosenDdItem(undefined)
      setVaultCreating(false)
      setNewVaultAddress('')
    }
  }, [avaliableCollaterals, show])

  // Data for 3rd screen, in case we have only 1 collateral to add
  const firstCollateralMetadata = useMemo(
    () => (collaterals?.[0]?.id ? collateralsToSelect[collaterals[0].id] : undefined),
    [collateralsToSelect, collaterals],
  )

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
  const showBakerAddress = useMemo(
    () => bakerChosenDdItem?.bakerName && collaterals.find(({ id }) => isTezosAsset(collateralsToSelect[id].assetName)),
    [bakerChosenDdItem?.bakerName, collaterals, collateralsToSelect],
  )
  const handleOnClickDropdownBakerItem = (itemId: number) =>
    setAssetChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))

  const isAddCollateralContinueDisabled = useMemo(() => {
    const needBakerForXTZ = collaterals.find(({ id }) => collateralsToSelect[id]?.assetName?.toLowerCase() === 'xtz')
    // Continue button to confirmation is disabled when:
    return Boolean(
      // async operation of creating vault instance on backend is not finished
      isVaultCreating ||
        // when we have invalid data in some inputs
        !collaterals.every(({ validationField }) => validationField === INPUT_STATUS_SUCCESS) ||
        // when we have selected xtz collateral and we haven't selected a baker for it
        (needBakerForXTZ && !bakerChosenDdItem),
    )
  }, [bakerChosenDdItem, collaterals, collateralsToSelect, isVaultCreating])

  // stuff to handle add collateral btn
  const nextAvaliableCollateralToAdd = useMemo(
    () => Object.values(collateralsToSelect).find(({ disabled }) => disabled === false),
    [collateralsToSelect],
  )

  const borrowingCapacity = useMemo(() => {
    const collateralsDeposited = collaterals.reduce((acc, { id, inputAmount }) => {
      const collateralRate = collateralsToSelect[id]?.assetRate
      if (collateralRate) acc += Number(inputAmount) * Number(collateralRate)

      return acc
    }, 0)
    return collateralsDeposited / 2
  }, [collaterals, collateralsToSelect])

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

      setCollateralsToSelect({
        ...collateralsToSelect,
        [nextAvaliableCollateralToAdd.id]: {
          ...collateralsToSelect[nextAvaliableCollateralToAdd.id],
          disabled: true,
        },
      })
    }
  }

  // stuff to handle collateral input dropdown
  const handleCollateralInputDdClick = (collateralIdx: number, listItemId: number, currentInputId: number) => {
    const selectedItem = collateralsToSelect[listItemId]

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

    setCollateralsToSelect({
      ...collateralsToSelect,
      [selectedItem.id]: {
        ...collateralsToSelect[selectedItem.id],
        disabled: true,
      },
      [currentInputId]: {
        ...collateralsToSelect[currentInputId],
        disabled: collateralsToSelect[currentInputId].isProtected
          ? collateralsToSelect[currentInputId].disabled
          : false,
      },
    })
  }

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, inputIdx: number, userAssetBalance: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= userAssetBalance
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && newInputAmount !== '' && newInputAmount !== '0') return

    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== inputIdx
          ? collateral
          : {
              ...collateral,
              validationField: validationStatus,
              inputAmount: newInputAmount,
            },
      ),
    )
  }

  const inputOnBlurHandle = (newInputAmount: string, inputIdx: number) => {
    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== inputIdx
          ? collateral
          : {
              ...collateral,
              inputAmount: newInputAmount === '' ? '0' : newInputAmount,
            },
      ),
    )
  }

  const onFocusHandler = (inputIdx: number) => {
    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== inputIdx
          ? collateral
          : {
              ...collateral,
              inputAmount: collateral.inputAmount === '0' ? '' : collateral.inputAmount,
            },
      ),
    )
  }

  const createVaultAction = async () => {
    if (currentMarketAsset) {
      try {
        setVaultCreating(true)
        const newVaultData = await dispatch(triggerInitialVaultCreation(currentMarketAsset))
        setNewVaultAddress(String(newVaultData))
      } catch (e) {
        setShownScreen(INITIAL_SCREEN_ID)
        console.log('fetching new vault data error', e)
      } finally {
        setVaultCreating(false)
      }
    }
  }

  const depositCollateralHandler = () => {
    const collaretalToDeposit = collaterals.reduce<
      Array<{
        collateralName: string
        amount: number
        assetId: number
        assetAddress: string
        tokenType: 'tez' | 'fa2' | 'fa12'
      }>
    >((acc, { id, inputAmount }) => {
      const { assetName, assetDecimals, assetAddress, tokenType } = collateralsToSelect[id] ?? {}

      if (assetName && assetDecimals) {
        acc.push({
          collateralName: assetName,
          assetId: id,
          tokenType,
          amount: Math.floor(Number(inputAmount) * 10 ** assetDecimals),
          assetAddress,
        })
      }

      return acc
    }, [])

    if (newVaultAddress && !isAddCollateralContinueDisabled && collaretalToDeposit.length > 0) {
      dispatch(
        depositCollateralAction(newVaultAddress, collaretalToDeposit, closePopup, bakerChosenDdItem?.bakerAddress),
      )
    }
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
                  const collaterallMetadata = collateralsToSelect[inputCollateralId]

                  if (!collaterallMetadata) return null
                  const isXTZCollateral = isTezosAsset(collaterallMetadata.assetName)

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
                          onChange: (e) => inputOnChangeHandle(e.target.value, idx, collaterallMetadata.userBalance),
                          onBlur: (e) => inputOnBlurHandle(e.target.value, idx),
                          onFocus: () => onFocusHandler(idx),
                        }}
                        settings={{
                          balanceAsset: collaterallMetadata.assetName,
                          useMaxHandler: () =>
                            inputOnChangeHandle(
                              String(collaterallMetadata.userBalance),
                              idx,
                              collaterallMetadata.userBalance,
                            ),
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
                            items={Object.values(collateralsToSelect)}
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
                            className="select-xtz-baker"
                            clickItem={handleOnClickDropdownBakerItem}
                          />
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              {/* button for despositting more than 1 collateral */}
              {/* <NewButton
                kind={ACTION_SIMPLE}
                disabled={!Boolean(nextAvaliableCollateralToAdd)}
                onClick={addNewCollateralHandler}
                className="add-collateral-inline"
              >
                + Add more assets as collateral
              </NewButton> */}

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
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Amount</div>
                    <CommaNumber value={Number(collaterals[0].inputAmount)} className="value" />
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
                      const collateralMetadata = collateralsToSelect[collateralId]
                      if (!collateralMetadata) return null

                      return (
                        <TableRow
                          rowHeight={40}
                          borderColor="dataColor"
                          className="add-hover"
                          key={collateralId + collateralMetadata.assetName}
                        >
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
                {showBakerAddress && bakerChosenDdItem ? (
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
                  <CommaNumber value={borrowingCapacity} className="value" beginningText="$" />
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
                <NewButton
                  kind={ACTION_PRIMARY}
                  onClick={depositCollateralHandler}
                  className="modal-manage-btn"
                  disabled={isActionLoading}
                >
                  <Icon id="plus" />
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
