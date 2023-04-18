import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'
import { CreateVaultPopupDataType, VaultNameInputStateType } from './Modals.helpers'
import { isTezosAsset, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { AvaliableCollateralType, XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SimpleCircleSpinnerLoader } from 'app/App.components/Loader/Loader.view'
import { DDItemId, DropDown, DropdownInputCustomChild, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
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
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { triggerInitialVaultCreation } from 'pages/Loans/Actions/vault.actions'
import { depositCollateralAction } from 'pages/Loans/Actions/vaultCollateral.actions'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'

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
  const { currentMarketAsset, setCreatedVaultAddress } = data ?? {}
  const dispatch = useDispatch()
  const {
    xtzBakers: { otherBakers, dao, mavrykDynamics },
  } = useSelector((state: State) => state.tokens)
  const xtzBakers: Array<XtzBakerType & { isDisabled?: boolean }> = [
    ...otherBakers,
    ...(dao ? [dao] : []),
    ...(mavrykDynamics ? [mavrykDynamics] : []),
  ]

  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const [shownScreen, setShownScreen] = useState<CurrentActiveModalScreen>(INITIAL_SCREEN_ID)
  const [collateralsToSelect, setCollateralsToSelect] = useState<Record<DDItemId, DropDownCollateralAssetType>>({})
  const [collaterals, setCollaterals] = useState<Array<InputCollateral>>([])
  const [vaultName, setVaultName] = useState<VaultNameInputStateType>({ name: '', validationStatus: '' })
  const [isVaultCreating, setVaultCreating] = useState(false)
  const [newVaultAddress, setNewVaultAddress] = useState('')

  useLockBodyScroll(show)

  useEffect(() => {
    if (avaliableCollaterals.length === 0) return

    const mappedAvaliableCollaterals = avaliableCollaterals.reduce<Record<DDItemId, DropDownCollateralAssetType>>(
      (acc, collateralData) => {
        acc[collateralData.id] = {
          ...collateralData,
          content: <DropdownInputCustomChild iconSrc={collateralData.icon} symbol={collateralData.symbol} />,
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
      xtzBakers.map(({ name, fee, logo, address, yield: bakerYield, freespace, isDisabled }, idx) => ({
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              <ImageWithPlug imageLink={logo} alt={`${name} icon`} /> {name}
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
        disabled: isDisabled,
      })),
    [xtzBakers],
  )
  const [bakerChosenDdItem, setAssetChosenDdItem] = useState<DropDownXTZBakerType | undefined>()
  const showBakerAddress = useMemo(
    () => bakerChosenDdItem?.bakerName && collaterals.find(({ id }) => isTezosAsset(collateralsToSelect[id].gqlName)),
    [bakerChosenDdItem?.bakerName, collaterals, collateralsToSelect],
  )
  const handleOnClickDropdownBakerItem = (itemId: DDItemId) =>
    setAssetChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))

  const isAddCollateralContinueDisabled = useMemo(() => {
    const needBakerForXTZ = collaterals.find(({ id }) => isTezosAsset(collateralsToSelect[id].gqlName))
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
      const collateralRate = collateralsToSelect[id]?.rate
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

  //handle vaultName input
  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const validationStatus =
      value && value.length <= 15 && /^[A-Za-z\s]*$/g.test(value) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

    setVaultName({ name: value, validationStatus })
  }

  // stuff to handle collateral input dropdown
  const handleCollateralInputDdClick = (collateralIdx: number, listItemId: DDItemId, currentInputId: number) => {
    const selectedItem = collateralsToSelect[listItemId]

    if (!selectedItem) return

    setCollaterals(
      collaterals.map((collateral, updateCollateralIdx) =>
        updateCollateralIdx !== collateralIdx
          ? collateral
          : {
              ...collateral,
              name: String(selectedItem?.name),
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
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount: userAssetBalance,
      options: {
        byDecimalPlaces: 8,
      },
    })

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
        //TODO: connect this value to an input
        const newVaultData = await dispatch(triggerInitialVaultCreation(currentMarketAsset, vaultName.name))
        setCreatedVaultAddress?.(String(newVaultData))
        setNewVaultAddress(String(newVaultData))
      } catch (e) {
        setShownScreen(INITIAL_SCREEN_ID)
        console.log('Fetching new vault data error', e)
      } finally {
        setVaultCreating(false)
      }
    }
  }

  const depositCollateralHandler = () => {
    // const collaretalToDeposit = collaterals.reduce<
    //   Array<{
    //     collateralName: string
    //     amount: number
    //     assetId: number
    //     assetAddress: string
    //     tokenType: 'tez' | 'fa2' | 'fa12'
    //   }>
    // >((acc, { id, inputAmount }) => {
    //   const { assetDecimals, assetAddress, tokenType, gqlName } = collateralsToSelect[id] ?? {}

    //   if (gqlName && assetDecimals) {
    //     acc.push({
    //       collateralName: gqlName,
    //       assetId: id,
    //       tokenType,
    //       amount: Math.floor(Number(inputAmount) * 10 ** assetDecimals),
    //       assetAddress,
    //     })
    //   }

    //   return acc
    // }, [])

    const { decimals, address, tokenType, gqlName } = collateralsToSelect[collaterals[0].id]

    const collaretalToDeposit = {
      collateralName: gqlName,
      assetId: collaterals[0].id,
      tokenType,
      decimals,
      amount: Number(collaterals[0].inputAmount),
      assetAddress: address,
    }

    if (newVaultAddress && !isAddCollateralContinueDisabled) {
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
      ? `Create a personal vault to begin borrowing.
        You are able to borrow one asset type per vault (Ex: If you would like to borrow
        USDT & EURL, you will need one vault for each). As collateral to back your loan,
        you may deposit multiple assets together into a single vault, and borrow against
        a basket of assets (Ex: You may borrow USDT against your portfolio of XTZ & tzBTC
        in a single vault).`
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
              <Input
                className={`vault-name`}
                inputProps={{
                  value: vaultName.name,
                  type: 'text',
                  onChange: handleVaultNameChange,
                  placeholder: 'Enter Vault Name',
                }}
                settings={{
                  inputStatus: vaultName.validationStatus,
                  label: 'Vault name',
                  inputSize: INPUT_LARGE,
                }}
              />
              <div className="manage-btn">
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={() => {
                    setShownScreen(ADD_COLLATERAL_SCREEN_ID)
                    createVaultAction()
                  }}
                  disabled={vaultName.validationStatus !== INPUT_STATUS_SUCCESS}
                >
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              </div>
            </>
          ) : null}

          {/* showing add collateral screen */}
          {shownScreen === 'addCollateral' ? (
            <>
              <div className="collateral-list">
                {collaterals.map(({ inputAmount, validationField, id: inputCollateralId }, idx) => {
                  const collateralMetadata = collateralsToSelect[inputCollateralId]

                  if (!collateralMetadata) return null
                  const isXTZCollateral = isTezosAsset(collateralMetadata.gqlName)

                  return (
                    <div className="collateral-block" key={inputCollateralId}>
                      <div className="block-name">Select Collateral Asset and Amount</div>
                      <Input
                        className={`${collateralMetadata.rate ? 'input-with-rate' : ''} pinned-dropdown`}
                        inputProps={{
                          value: inputAmount,
                          type: 'number',
                          onChange: (e) => inputOnChangeHandle(e.target.value, idx, collateralMetadata.userBalance),
                          onBlur: (e) => inputOnBlurHandle(e.target.value, idx),
                          onFocus: () => onFocusHandler(idx),
                        }}
                        settings={{
                          balanceAsset: collateralMetadata.symbol,
                          useMaxHandler: () =>
                            inputOnChangeHandle(
                              String(collateralMetadata.userBalance),
                              idx,
                              collateralMetadata.userBalance,
                            ),
                          inputStatus: validationField,
                          ...(collateralMetadata.rate
                            ? { convertedValue: Number(collateralMetadata.rate) * Number(inputAmount) }
                            : {}),
                          balance: collateralMetadata.userBalance,
                          inputSize: INPUT_LARGE,
                        }}
                      >
                        <InputPinnedDropDown>
                          <DropDown
                            placeholder=""
                            activeItem={{
                              content: (
                                <DropdownInputCustomChild
                                  iconSrc={collateralMetadata.icon}
                                  symbol={collateralMetadata.symbol}
                                />
                              ),
                              id: inputCollateralId,
                            }}
                            items={Object.values(collateralsToSelect)}
                            clickItem={(itemId: DDItemId) =>
                              handleCollateralInputDdClick(idx, itemId, inputCollateralId)
                            }
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
                kind={BUTTON_SIMPLE}
                disabled={!Boolean(nextAvaliableCollateralToAdd)}
                onClick={addNewCollateralHandler}
                className="add-collateral-inline"
              >
                + Add more assets as collateral
              </NewButton> */}

              <div className="manage-btn">
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={() => setShownScreen(CONFIRMATION_SCREEN_ID)}
                  disabled={isAddCollateralContinueDisabled}
                >
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              </div>

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
                    <div className="value">{firstCollateralMetadata?.symbol}</div>
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Amount</div>
                    <CommaNumber
                      value={Number(collaterals[0].inputAmount)}
                      decimalsToShow={assetDecimalsToShow}
                      className="value"
                    />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">USD Value</div>
                    {firstCollateralMetadata?.rate ? (
                      <CommaNumber
                        value={Number(collaterals[0].inputAmount) * Number(firstCollateralMetadata?.rate)}
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
                      <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="treasury">
                    {collaterals.length ? (
                      collaterals.map(({ inputAmount, id: collateralId }) => {
                        const collateralMetadata = collateralsToSelect[collateralId]
                        if (!collateralMetadata) return null

                        return (
                          <TableRow
                            rowHeight={40}
                            borderColor="dataColor"
                            className="add-hover"
                            key={collateralId + collateralMetadata.name}
                          >
                            <TableCell width="42%">{collateralMetadata.symbol}</TableCell>
                            <TableCell width="28%">
                              <CommaNumber value={Number(inputAmount)} />
                            </TableCell>
                            <TableCell contentPosition="right" width="28%">
                              {collateralMetadata?.rate ? (
                                <CommaNumber
                                  value={Number(inputAmount) * Number(collateralMetadata?.rate)}
                                  className="value"
                                  beginningText="$"
                                />
                              ) : (
                                <div className="value">-</div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow rowHeight={10}>
                        <TableCell width="42%" />
                        <TableCell width="28%" />
                        <TableCell width="28%" />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              <div className="confirm-collateral-deposit-cv">
                {showBakerAddress && bakerChosenDdItem ? (
                  <ThreeLevelListItem>
                    <div className="name">Selected Baker</div>
                    <div className="value">{bakerChosenDdItem.bakerName}</div>
                  </ThreeLevelListItem>
                ) : null}

                <ThreeLevelListItem>
                  <div className="name">
                    Borrowing Capacity{' '}
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={silverColor}
                      text="How much you are able to borrow given your current collateral ratio including the amount you wish to borrow and the total amount available to borrow from the pool."
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber value={borrowingCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </div>
              <div className="buttons-wrapper" style={{ marginTop: '30px' }}>
                <NewButton
                  kind={BUTTON_SECONDARY}
                  form={BUTTON_WIDE}
                  onClick={() => setShownScreen(ADD_COLLATERAL_SCREEN_ID)}
                >
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={depositCollateralHandler}
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
