import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  INPUT_STATUS_DEFAULT,
  getOnFocusValue,
  getOnBlurValue,
} from 'app/App.components/Input/Input.constants'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { DDItemId, DropDown, DropdownInputCustomChild, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import { Input } from 'app/App.components/Input/NewInput'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { State } from 'reducers'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { silverColor } from 'styles'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { triggerInitialVaultCreation } from 'pages/Loans/Actions/vault.actions'
import { depositCollateralsAction } from 'pages/Loans/Actions/vaultCollateral.actions'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { containSpaces } from 'app/App.utils/input'
import { CreateVaultPopupDataType } from 'providers/LoansProvider/helpers/LoansModals.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
  isTezosAsset,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'

type CurrentActiveModalScreen =
  | typeof INITIAL_SCREEN_ID
  | typeof ADD_COLLATERAL_SCREEN_ID
  | typeof CONFIRMATION_SCREEN_ID

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
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()
  const { userTokensBalances } = useUserContext()
  const {
    // TODO: test it
    myVaultsIds,
    vaultsMapper,
  } = useVaultsContext()

  const { bakers, choosenBaker, setChoosenBaker } = useXtzBakersForDD()

  useLockBodyScroll(show)
  const dispatch = useDispatch()

  const [shownScreen, setShownScreen] = useState<CurrentActiveModalScreen>(INITIAL_SCREEN_ID)
  const [vaultName, setVaultName] = useState<{ name: string; validationStatus: InputStatusType; errorMessage: string }>(
    {
      name: '',
      validationStatus: '',
      errorMessage: '',
    },
  )
  const [isVaultCreating, setVaultCreating] = useState(false)
  const [newVaultAddress, setNewVaultAddress] = useState('')
  const [selectedCollaterals, setSelectedCollaterals] = useState<
    Record<TokenAddressType, { tokenAddress: TokenAddressType; amount: string; validation: InputStatusType }>
  >({})
  const selectedCollateralsAddresses = useMemo(() => Object.keys(selectedCollaterals), [selectedCollaterals])

  useEffect(() => {
    if (!show) {
      setShownScreen(INITIAL_SCREEN_ID)
      setVaultCreating(false)
      setNewVaultAddress('')
      setVaultName({ name: '', validationStatus: '', errorMessage: '' })
    }
  }, [show])

  // TODO: consider esctract to hook, cuz it's repeated twice (2nd add new collateral)
  const mappedAvaliableCollaterals = useMemo(() => {
    let firstNotDisabledCollateralAddress: string | null = null

    const reducedCollaterals = collateralTokens.reduce<
      Record<DDItemId, DropDownItemType & { tokenAddress: TokenAddressType }>
    >((acc, collateralTokenAddress) => {
      const collateral = getTokenDataByAddress({ tokenAddress: collateralTokenAddress, tokensMetadata, tokensPrices })

      if (collateral && checkWhetherTokenIsCollateralToken(collateral)) {
        const { address, icon, symbol } = collateral

        const isCollateralDisabled = Boolean(
          collateral.loanData.isProtectedCollateral || selectedCollaterals[collateralTokenAddress],
        )

        if (!isCollateralDisabled && !firstNotDisabledCollateralAddress)
          firstNotDisabledCollateralAddress = collateralTokenAddress

        acc[address] = {
          id: address,
          tokenAddress: address,
          content: <DropdownInputCustomChild iconSrc={icon} symbol={symbol} />,
          disabled: isCollateralDisabled,
        }
      }
      return acc
    }, {})

    if (!selectedCollateralsAddresses.length && firstNotDisabledCollateralAddress) {
      reducedCollaterals[firstNotDisabledCollateralAddress].disabled = true
      setSelectedCollaterals({
        [firstNotDisabledCollateralAddress]: {
          tokenAddress: firstNotDisabledCollateralAddress,
          amount: '0',
          validation: INPUT_STATUS_DEFAULT,
        },
      })
    }

    return reducedCollaterals
  }, [collateralTokens, selectedCollaterals, selectedCollateralsAddresses, tokensMetadata, tokensPrices])

  if (!data) return null

  const { avaliableLiquidity, marketTokenAddress, setCreatedVaultAddress } = data

  const hasXTZTokenSelected = selectedCollateralsAddresses.find((tokenAddress) => isTezosAsset(tokenAddress))
  const isAddCollateralContinueDisabled = Boolean(
    isVaultCreating ||
      (hasXTZTokenSelected && choosenBaker) ||
      !selectedCollateralsAddresses.find(
        (tokenAddress) => selectedCollaterals[tokenAddress].validation !== INPUT_STATUS_SUCCESS,
      ),
  )

  const nextAvaliableCollateralToAdd = Object.values(mappedAvaliableCollaterals).find(
    ({ disabled, tokenAddress }) => disabled === false && !selectedCollateralsAddresses.includes(tokenAddress),
  )

  const collateralsBalance =
    selectedCollateralsAddresses.reduce((acc, collateralAddress) => {
      const collateralToken = getTokenDataByAddress({ tokenAddress: collateralAddress, tokensPrices, tokensMetadata })

      if (!collateralToken || !collateralToken.rate) return acc

      const { amount } = selectedCollaterals[collateralAddress]
      const { rate } = collateralToken

      return (acc += Number(amount) * Number(rate))
    }, 0) / 2

  const borrowCapacity = Math.min(Math.max(collateralsBalance, avaliableLiquidity, 0))

  const addNewCollateralHandler = () => {
    if (nextAvaliableCollateralToAdd) {
      setSelectedCollaterals((prev) => ({
        ...prev,
        [nextAvaliableCollateralToAdd.tokenAddress]: {
          tokenAddress: nextAvaliableCollateralToAdd.tokenAddress,
          amount: '0',
          validation: INPUT_STATUS_DEFAULT,
        },
      }))
    }
  }

  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const validationStatus = validateVaultLength(value, myVaultsIds, vaultsMapper)

    setVaultName((prev) => ({ ...prev, name: value, validationStatus }))
  }

  const handleVaultNameOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containSpaces(e.target.value)) {
      const trimmedValue = e.target.value.trim()
      const validationStatus = validateVaultLength(trimmedValue, myVaultsIds, vaultsMapper)
      setVaultName((prev) => ({ ...prev, validationStatus, name: trimmedValue }))
    }
  }

  // stuff to handle inputs
  const inputOnChangeHandle = (
    newInputAmount: string,
    userCollateralBalance: number,
    collateralAddress: TokenAddressType,
    collateralDecimals: number,
  ) => {
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount: userCollateralBalance,
      options: {
        byDecimalPlaces: collateralDecimals,
      },
    })

    setSelectedCollaterals((prev) => ({
      ...prev,
      [collateralAddress]: {
        ...prev[collateralAddress],
        amount: newInputAmount,
        validation: validationStatus,
      },
    }))
  }

  const inputOnBlurHandle = (collateralAddress: TokenAddressType) =>
    setSelectedCollaterals((prev) => ({
      ...prev,
      [collateralAddress]: {
        ...prev[collateralAddress],
        amount: getOnBlurValue(prev[collateralAddress].amount),
      },
    }))

  const onFocusHandler = (collateralAddress: TokenAddressType) =>
    setSelectedCollaterals((prev) => ({
      ...prev,
      [collateralAddress]: {
        ...prev[collateralAddress],
        amount: getOnFocusValue(prev[collateralAddress].amount),
      },
    }))

  const createVaultAction = async () => {
    try {
      setVaultCreating(true)
      const newVaultData = await dispatch(triggerInitialVaultCreation(marketTokenAddress, vaultName.name))
      setCreatedVaultAddress?.(String(newVaultData))
      setNewVaultAddress(String(newVaultData))
    } catch (e) {
      setShownScreen(INITIAL_SCREEN_ID)
      console.log('Fetching new vault data error', e)
    } finally {
      setVaultCreating(false)
    }
  }

  const depositCollateralHandler = () => {
    const collaretalsToDeposit = selectedCollateralsAddresses.reduce<
      Array<{
        collateralName: string
        amount: number
        id: number
        address: string
        type: TokenType
      }>
    >((acc, tokenAddress) => {
      const collateralToken = getTokenDataByAddress({ tokenAddress, tokensMetadata })

      if (collateralToken && checkWhetherTokenIsCollateralToken(collateralToken)) {
        acc.push({
          collateralName: collateralToken.loanData.indexerName,
          address: tokenAddress,
          id: collateralToken.id,
          type: collateralToken.type,
          amount: convertNumberForContractCall({
            number: Number(selectedCollaterals[tokenAddress].amount),
            grade: collateralToken.decimals,
          }),
        })
      }

      return acc
    }, [])

    if (newVaultAddress) {
      dispatch(depositCollateralsAction(newVaultAddress, collaretalsToDeposit, closePopup, choosenBaker?.bakerAddress))
    }
  }

  const firstSelectedCollateralTokenData = getTokenDataByAddress({
    tokenAddress: selectedCollateralsAddresses[0],
    tokensPrices,
    tokensMetadata,
  })

  const titleText =
    shownScreen === 'initial'
      ? 'Create New Vault'
      : shownScreen === 'addCollateral'
      ? 'Select Collateral For Vault'
      : 'Confirm Collateral Deposit'

  const descrText =
    shownScreen === 'initial' ? (
      <>
        <p>
          Create a personal vault to begin borrowing. You may only choose one asset (USDT, EURL, or XTZ) to be borrowed
          per vault.
        </p>
        <p>
          In your vault, you may deposit a basket of assets such as XTZ, tzBTC, USDT, and EURL together as collateral.
        </p>
      </>
    ) : shownScreen === 'addCollateral' ? (
      `Select an one or multiple assets to add as collateral. If you are providing XTZ as collateral, make sure you
      select a baker.`
    ) : (
      `Please confirm the following details.`
    )

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <H2Title>{titleText}</H2Title>
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
                inputProps={{
                  value: vaultName.name,
                  type: 'text',
                  onChange: handleVaultNameChange,
                  onBlur: handleVaultNameOnBlur,
                  placeholder: 'e.g. Satoshi’s Personal Vault',
                }}
                settings={{
                  inputStatus: vaultName.validationStatus,
                  inputSize: INPUT_LARGE,
                  errorMessage: vaultName.errorMessage,
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
                {selectedCollateralsAddresses.map((collateralAddress) => {
                  const collateralToken = getTokenDataByAddress({
                    tokenAddress: collateralAddress,
                    tokensMetadata,
                    tokensPrices,
                  })

                  if (!collateralToken || !collateralToken.rate) return null

                  const { amount, validation } = selectedCollaterals[collateralAddress]
                  const { symbol, rate, decimals, icon } = collateralToken

                  const userAssetBalance = getUserTokenBalanceByAddress({
                    userTokensBalances,
                    tokenAddress: collateralAddress,
                  })

                  return (
                    <div className="collateral-block" key={symbol}>
                      <div className="block-name">Select Collateral Asset and Amount</div>
                      <Input
                        className={`input-with-rate pinned-dropdown`}
                        inputProps={{
                          value: amount,
                          type: 'number',
                          onChange: (e) =>
                            inputOnChangeHandle(e.target.value, userAssetBalance, collateralAddress, decimals),
                          onBlur: () => inputOnBlurHandle(collateralAddress),
                          onFocus: () => onFocusHandler(collateralAddress),
                        }}
                        settings={{
                          balanceAsset: symbol,
                          useMaxHandler: () =>
                            inputOnChangeHandle(
                              getLoansInputMaxAmount(userAssetBalance, decimals),
                              userAssetBalance,
                              collateralAddress,
                              decimals,
                            ),
                          inputStatus: validation,
                          convertedValue: rate * Number(amount),
                          balance: userAssetBalance,
                          inputSize: INPUT_LARGE,
                        }}
                      >
                        <InputPinnedDropDown>
                          <DropDown
                            placeholder=""
                            activeItem={{
                              content: <DropdownInputCustomChild iconSrc={icon} symbol={symbol} />,
                              id: collateralAddress,
                            }}
                            items={Object.values(mappedAvaliableCollaterals)}
                            clickItem={(newCollateralAddress: DDItemId) => {
                              if (typeof newCollateralAddress === 'string') {
                                setSelectedCollaterals((prev) => {
                                  const {
                                    [collateralAddress]: currentCollateralObj,
                                    ...collateralsWithoutCurrentCollateral
                                  } = prev

                                  return {
                                    ...collateralsWithoutCurrentCollateral,
                                    [newCollateralAddress]: {
                                      ...currentCollateralObj,
                                      tokenAddress: newCollateralAddress,
                                    },
                                  }
                                })
                              }
                            }}
                            className="input-dropdown"
                          />
                        </InputPinnedDropDown>
                      </Input>
                    </div>
                  )
                })}
              </div>

              {hasXTZTokenSelected ? (
                <div className="xtz-baker">
                  <div className="block-name">Select Baker</div>
                  <DropDown
                    placeholder="Select Bakery"
                    activeItem={choosenBaker}
                    items={bakers}
                    className="select-xtz-baker"
                    clickItem={(bakerAddress: DDItemId) =>
                      typeof bakerAddress === 'string' ? setChoosenBaker(bakerAddress) : null
                    }
                  />
                </div>
              ) : null}

              {/* button for depositting more than 1 collateral */}
              <NewButton
                kind={BUTTON_SIMPLE}
                disabled={!Boolean(nextAvaliableCollateralToAdd)}
                onClick={addNewCollateralHandler}
              >
                + Add more assets as collateral
              </NewButton>

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
                  <SpinnerCircleLoaderStyled />
                </div>
              ) : null}
            </>
          ) : null}

          {/* showing confirmation screen */}
          {shownScreen === 'confirmation' ? (
            <>
              {selectedCollateralsAddresses.length === 1 &&
              firstSelectedCollateralTokenData &&
              firstSelectedCollateralTokenData.rate ? (
                <div className="confirm-create-vault" style={{ marginBottom: '30px' }}>
                  <ThreeLevelListItem>
                    <div className="name">Asset</div>
                    <div className="value">{firstSelectedCollateralTokenData.symbol}</div>
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Amount</div>
                    <CommaNumber
                      value={Number(selectedCollaterals[firstSelectedCollateralTokenData.address].amount)}
                      decimalsToShow={assetDecimalsToShow}
                      className="value"
                    />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">USD Value</div>
                    <CommaNumber
                      value={
                        Number(selectedCollaterals[firstSelectedCollateralTokenData.address].amount) *
                        firstSelectedCollateralTokenData.rate
                      }
                      className="value"
                      beginningText="$"
                    />
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
                    {selectedCollateralsAddresses.map((collateralAddress, idx) => {
                      const collateralToken = getTokenDataByAddress({
                        tokenAddress: collateralAddress,
                        tokensMetadata,
                        tokensPrices,
                      })

                      if (!collateralToken || !collateralToken.rate) return null

                      const { amount } = selectedCollaterals[collateralAddress]
                      const { symbol, rate } = collateralToken

                      return (
                        <TableRow rowHeight={40} borderColor="dataColor" className="add-hover" key={symbol}>
                          <TableCell width="42%">{symbol}</TableCell>
                          <TableCell width="28%">
                            <CommaNumber value={Number(amount)} />
                          </TableCell>
                          <TableCell contentPosition="right" width="28%">
                            <CommaNumber value={Number(amount) * rate} className="value" beginningText="$" />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              <div className="confirm-create-vault">
                {hasXTZTokenSelected && choosenBaker ? (
                  <ThreeLevelListItem>
                    <div className="name">Selected Baker</div>
                    <div className="value">{choosenBaker.bakerName}</div>
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
                  <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>

                <ThreeLevelListItem>
                  <div className="name">Vault Name</div>
                  <div className="value">{vaultName.name}</div>
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
                  disabled={isAddCollateralContinueDisabled}
                  onClick={depositCollateralHandler}
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

// validation helper
export function validateVaultLength(
  value: string,
  myVaultsIds: string[],
  vaultsMapper: Record<string, VaultType>,
): InputStatusType {
  return value &&
    value.length <= 15 &&
    !myVaultsIds.find((vaultId) => vaultsMapper[vaultId].name.trim().toLowerCase() === value.trim().toLowerCase())
    ? INPUT_STATUS_SUCCESS
    : INPUT_STATUS_ERROR
}
