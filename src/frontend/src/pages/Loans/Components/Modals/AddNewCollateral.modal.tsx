import { useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'
import { State } from 'reducers'
import { useDispatch, useSelector } from 'react-redux'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DDItemId, DropDown, DropdownInputCustomChild } from 'app/App.components/DropDown/NewDropdown'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Input } from 'app/App.components/Input/NewInput'
import { DropDownCollateralAssetType, DropDownXTZBakerType } from './CreateNewVault.modal'
import NewButton from 'app/App.components/Button/NewButton'

import { calcCollateralRatio, isTezosAsset } from 'pages/Loans/Loans.helpers'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { depositCollateralAction } from 'pages/Loans/Actions/vaultCollateral.actions'
import { AddNewCollateralDataProps, getOnBlurValue, getOnFocusValue } from './Modals.helpers'
import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'

import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { DropDownJsxChild, LoansModalBase, VaultModalOverview } from './Modals.style'
import { XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

type InputState =
  | {
      amount: string
      assetName: string
      userBalance: number
      id: DDItemId
      validationStatus: InputStatusType
      ddItems: Record<DDItemId, DropDownCollateralAssetType>
      selectedDdItem: DropDownCollateralAssetType
    }
  | undefined

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239633&t=Sx2aEpp3ifrGxBtQ-0
export const AddNewCollateral = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: AddNewCollateralDataProps
}) => {
  const {
    vaultCollateralBalance = 0,
    vaultAddress,
    currentCollateralRatio = 0,
    collateralWithdrawAmount = 0,
    borrowedAmount = 0,
    borrowedAssetRate = 0,
    existingCollaterals,
  } = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const {
    xtzBakers: { otherBakers, dao, mavrykDynamics },
  } = useSelector((state: State) => state.loans)
  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const xtzBakers: Array<XtzBakerType & { isDisabled?: boolean }> = [
    ...otherBakers,
    ...(dao ? [dao] : []),
    ...(mavrykDynamics ? [mavrykDynamics] : []),
  ]

  const [inputData, setInputData] = useState<InputState>()

  // resetting popup state, when toggling it off, and updating input data, when collaterals updated in redux
  useEffect(() => {
    if (avaliableCollaterals.length === 0) return

    const mappedAvaliableCollaterals = avaliableCollaterals.reduce<Record<DDItemId, DropDownCollateralAssetType>>(
      (acc, collateralData) => {
        acc[collateralData.id] = {
          ...collateralData,
          content: <DropdownInputCustomChild iconSrc={collateralData.icon} symbol={collateralData.symbol} />,
          disabled: Boolean(
            collateralData.isProtected ||
              existingCollaterals?.find(({ gqlName }) => collateralData.gqlName === gqlName),
          ),
        }
        return acc
      },
      {},
    )

    const firstNotDisabledCollateralId = Number(
      Object.keys(mappedAvaliableCollaterals).find((id) => mappedAvaliableCollaterals[Number(id)].disabled === false),
    )
    mappedAvaliableCollaterals[firstNotDisabledCollateralId].disabled = true

    setInputData({
      amount: '0',
      assetName: mappedAvaliableCollaterals[firstNotDisabledCollateralId].gqlName,
      userBalance: mappedAvaliableCollaterals[firstNotDisabledCollateralId].userBalance,
      validationStatus: '',
      id: mappedAvaliableCollaterals[firstNotDisabledCollateralId].id,
      ddItems: mappedAvaliableCollaterals,
      selectedDdItem: mappedAvaliableCollaterals[firstNotDisabledCollateralId],
    })

    if (!show) {
      setInputData(undefined)
    }
  }, [avaliableCollaterals, show, existingCollaterals])

  const { futureCollateralRatio, futureCollateralWithdraw, futureCollateralBalance } = useMemo(() => {
    if (inputData) {
      const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)
      const selectedAsset = avaliableCollaterals.find(({ id }) => id === inputData?.id)
      const futureCollateralRatio = selectedAsset
        ? calcCollateralRatio(vaultCollateralBalance + inputAmount, borrowedAmount, borrowedAssetRate)
        : 0

      const futureCollateralWithdraw = collateralWithdrawAmount + inputAmount
      const futureCollateralBalance = vaultCollateralBalance + inputAmount * Number(selectedAsset?.rate)
      return { futureCollateralRatio, futureCollateralWithdraw, futureCollateralBalance }
    }
    return { futureCollateralRatio: 0, futureCollateralWithdraw: 0, futureCollateralBalance: 0 }
  }, [
    inputData,
    avaliableCollaterals,
    vaultCollateralBalance,
    borrowedAmount,
    borrowedAssetRate,
    collateralWithdrawAmount,
  ])

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
  const showBakerAddress = useMemo(() => isTezosAsset(inputData?.assetName ?? ''), [inputData])
  const handleOnClickDropdownBakerItem = (itemId: DDItemId) =>
    setAssetChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))

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
        amount: getOnBlurValue(inputData.amount),
      })
    }
  }

  const onFocusHandler = () => {
    if (inputData) {
      setInputData({
        ...inputData,
        amount: getOnFocusValue(inputData.amount),
      })
    }
  }

  const clickOnInputDDItem = (id: DDItemId) => {
    if (inputData) {
      // resetting disabled flags for item we had selected before, and enabling disabled, we have selected now
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
        assetName: inputData.ddItems[id].gqlName,
        selectedDdItem: inputData.ddItems[id],
        ddItems: newDDItems,
        id,
      })
    }
  }

  const isDepositBtnDisabled = useMemo(
    () =>
      isActionLoading ||
      (isTezosAsset(inputData?.assetName ?? '') && !bakerChosenDdItem) ||
      inputData?.validationStatus === INPUT_STATUS_ERROR,
    [bakerChosenDdItem, inputData?.assetName, inputData?.validationStatus, isActionLoading],
  )

  const depositCollateralHandler = () => {
    if (inputData) {
      const collaretalToDeposit = {
        collateralName: inputData.assetName,
        assetId: inputData.selectedDdItem.id,
        tokenType: inputData.selectedDdItem.tokenType,
        amount: Math.floor(Number(inputData.amount) * 10 ** inputData.selectedDdItem.decimals),
        assetAddress: inputData.selectedDdItem.address,
      }

      if (vaultAddress) {
        dispatch(
          depositCollateralAction(vaultAddress, collaretalToDeposit, closePopup, bakerChosenDdItem?.bakerAddress),
        )
      }
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
              <CommaNumber value={vaultCollateralBalance} beginningText="$" className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={collateralWithdrawAmount} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          {inputData ? (
            <>
              <Input
                className={`${inputData.selectedDdItem?.rate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
                inputProps={{
                  value: inputData.amount,
                  type: 'number',
                  onBlur: inputOnBlurHandle,
                  onFocus: onFocusHandler,
                  onChange: (e) => inputOnChangeHandle(e.target.value, inputData.userBalance),
                }}
                settings={{
                  balance: inputData.userBalance,
                  balanceAsset: isTezosAsset(inputData.assetName) ? 'XTZ' : inputData.assetName.toUpperCase(),
                  useMaxHandler: () =>
                    setInputData({
                      ...inputData,
                      amount: String(inputData.userBalance),
                      validationStatus: INPUT_STATUS_SUCCESS,
                    }),
                  inputSize: INPUT_LARGE,
                  inputStatus: inputData.validationStatus,
                  convertedValue: Number(inputData.amount) * inputData.selectedDdItem.rate,
                }}
              >
                <InputPinnedDropDown>
                  <DropDown
                    placeholder="Select Bakery"
                    activeItem={inputData.selectedDdItem}
                    items={Object.values(inputData.ddItems)}
                    clickItem={clickOnInputDDItem}
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
            <NewButton kind={BUTTON_PRIMARY} onClick={depositCollateralHandler} disabled={isDepositBtnDisabled}>
              <Icon id="plus" />
              Deposit
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
