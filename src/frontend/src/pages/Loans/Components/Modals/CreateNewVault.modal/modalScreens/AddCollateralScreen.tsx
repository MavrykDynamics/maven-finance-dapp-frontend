import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef } from 'react'

// providers
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// utils
import { validateInputLength } from 'app/App.utils/input/validateInput'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
  isTezosAsset,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'

// components
import Button from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { DDItemId, DropDown, DropdownInputCustomChild, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// styles
import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { CollateralInputWrapper, DeleteCollateralInputIconWrapper, ModalStatsBlock } from '../createNewVault.style'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'

// consts
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'
import {
  ERR_MSG_INPUT,
  getOnBlurValue,
  getOnFocusValue,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { CONFIRM_STATS_SCREEN_ID, INITIAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import { BORROW_CAPACITY, COLLATERAL_VALUE } from 'texts/tooltips/vault.text'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { useXTZMaxAmountValidator } from '../../hooks/Market/useXTZMaxValidator'
import { XTZLimitInfoBanner } from '../../components/XTZLimitInfoBanner'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'

export const AddCollateralScreen = () => {
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  const { bakersRecord, bakers } = useXtzBakersForDD()
  const {
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateSelectedCollaterals,
    updateScreenToShow,
    updateSelectedBaker,
    hasXTZTokenSelected,
    borrowCapacity,
    collateralsBalance,
    selectedBaker,
  } = useCreateVaultContext()

  // refs
  // TODO remove ref when moving mappedCollaterasl to separate file
  const noDisabledCollateralAddressRef = useRef('')

  const { isTezosToken, updateMaxedXTZData, willExceedXTZTheLimit } = useXTZMaxAmountValidator(
    selectedCollateralsAddresses,
    selectedCollaterals,
  )

  useEffect(() => {
    if (!selectedCollateralsAddresses.length) {
      updateSelectedCollaterals({
        [noDisabledCollateralAddressRef.current]: {
          tokenAddress: noDisabledCollateralAddressRef.current,
          amount: '0',
          validation: INPUT_STATUS_DEFAULT,
        },
      })
    }
  }, [noDisabledCollateralAddressRef.current])

  // TODO: consider esctract to hook, cuz it's repeated twice (2nd add new collateral)
  const mappedAvaliableCollaterals = useMemo(() => {
    let firstNotDisabledCollateralAddress: string | null = null

    const reducedCollaterals = collateralTokens.reduce<
      Record<DDItemId, DropDownItemType & { tokenAddress: TokenAddressType }>
    >((acc, collateralTokenAddress) => {
      const collateral = getTokenDataByAddress({
        tokenAddress: collateralTokenAddress,
        tokensMetadata,
        tokensPrices,
      })
      if (collateral && checkWhetherTokenIsCollateralToken(collateral)) {
        const { address, icon, symbol } = collateral

        const isCollateralDisabled = Boolean(
          collateral.loanData.isPausedCollateral ||
            selectedCollaterals[collateralTokenAddress] ||
            collateralTokenAddress === SMVN_TOKEN_ADDRESS,
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
      noDisabledCollateralAddressRef.current = firstNotDisabledCollateralAddress
    }

    return reducedCollaterals
  }, [collateralTokens, selectedCollaterals, selectedCollateralsAddresses.length, tokensMetadata, tokensPrices])

  const nextAvaliableCollateralToAdd = Object.values(mappedAvaliableCollaterals).find(
    ({ disabled, tokenAddress }) => !disabled && !selectedCollateralsAddresses.includes(tokenAddress),
  )

  const isAddCollateralContinueDisabled =
    (hasXTZTokenSelected && !selectedBaker) ||
    selectedCollateralsAddresses.some(
      (tokenAddress) => selectedCollaterals[tokenAddress].validation !== INPUT_STATUS_SUCCESS,
    )

  // handlers
  const addNewCollateralHandler = () => {
    if (nextAvaliableCollateralToAdd) {
      updateSelectedCollaterals({
        ...selectedCollaterals,
        [nextAvaliableCollateralToAdd.tokenAddress]: {
          tokenAddress: nextAvaliableCollateralToAdd.tokenAddress,
          amount: '0',
          validation: INPUT_STATUS_DEFAULT,
        },
      })
    }
  }

  const removeCollateralHandler = (tokenAddress: string) => {
    const _selectedCollateral = { ...selectedCollaterals }

    delete _selectedCollateral[tokenAddress]
    updateSelectedCollaterals({
      ..._selectedCollateral,
    })
  }

  //  handle inputs
  const inputOnChangeHandle = (
    newInputAmount: string,
    userCollateralBalance: number,
    collateralAddress: TokenAddressType,
    collateralDecimals: number,
  ) => {
    const validationStatus: InputStatusType = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount: isTezosToken ? userCollateralBalance - 1 : userCollateralBalance,
      options: {
        byDecimalPlaces: collateralDecimals,
      },
    })

    updateSelectedCollaterals({
      ...selectedCollaterals,
      [collateralAddress]: {
        ...selectedCollaterals[collateralAddress],
        amount: newInputAmount,
        validation: validationStatus,
      },
    })
  }

  const inputOnBlurHandle = (collateralAddress: TokenAddressType) =>
    updateSelectedCollaterals({
      ...selectedCollaterals,
      [collateralAddress]: {
        ...selectedCollaterals[collateralAddress],
        amount: getOnBlurValue(selectedCollaterals[collateralAddress].amount),
      },
    })

  const onFocusHandler = (collateralAddress: TokenAddressType) =>
    updateSelectedCollaterals({
      ...selectedCollaterals,
      [collateralAddress]: {
        ...selectedCollaterals[collateralAddress],
        amount: getOnFocusValue(selectedCollaterals[collateralAddress].amount),
      },
    })

  const continueHandler = useCallback(() => updateScreenToShow(CONFIRM_STATS_SCREEN_ID), [updateScreenToShow])
  const backHandler = useCallback(() => updateScreenToShow(INITIAL_SCREEN_ID), [updateScreenToShow])

  // collateral-list-overflow (for styles)
  const isContainingTwoCollaterals = selectedCollateralsAddresses.length > 2

  return (
    <div>
      <div>
        <div className="block-name">Select Collateral Asset and Amount</div>
        <div className={classNames({ 'collateral-list-wrapper-for-overflow': isContainingTwoCollaterals })}>
          <div
            className={classNames('collateral-list', 'scroll-block', {
              'collateral-list-overflow': isContainingTwoCollaterals,
            })}
          >
            {selectedCollateralsAddresses.map((collateralAddress, idx) => {
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
                <div className="collateral-block-wrapper" key={symbol}>
                  <div className="collateral-block">
                    <CollateralInputWrapper>
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
                          useMaxHandler: () => {
                            const maxAmount = getLoansInputMaxAmount(userAssetBalance, decimals)
                            const _amount = isTezosToken ? String(+maxAmount - 1) : maxAmount

                            if (isTezosToken) updateMaxedXTZData(Number(_amount))
                            inputOnChangeHandle(_amount, userAssetBalance, collateralAddress, decimals)
                          },
                          inputStatus: validation,
                          convertedValue: rate * Number(amount),
                          balance: userAssetBalance,
                          inputSize: INPUT_LARGE,
                          validationFns: [[validateInputLength, ERR_MSG_INPUT]],
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
                                const {
                                  [collateralAddress]: currentCollateralObj,
                                  ...collateralsWithoutCurrentCollateral
                                } = selectedCollaterals

                                updateSelectedCollaterals({
                                  ...collateralsWithoutCurrentCollateral,
                                  [newCollateralAddress]: {
                                    ...currentCollateralObj,
                                    tokenAddress: newCollateralAddress,
                                    amount: '0',
                                    validation: INPUT_STATUS_DEFAULT,
                                  },
                                })
                              }
                            }}
                            className="input-dropdown"
                          />
                        </InputPinnedDropDown>
                      </Input>
                      {idx !== 0 && (
                        <DeleteCollateralInputIconWrapper>
                          <Button
                            kind={BUTTON_SIMPLE}
                            onClick={() => removeCollateralHandler(selectedCollaterals[collateralAddress].tokenAddress)}
                          >
                            <Icon id="delete" />
                          </Button>
                        </DeleteCollateralInputIconWrapper>
                      )}
                    </CollateralInputWrapper>
                  </div>
                  {isTezosAsset(collateralAddress) && (
                    <div className="xtz-baker">
                      <div className="block-name">Select Baker</div>
                      <DropDown
                        placeholder="Select Bakery"
                        activeItem={selectedBaker}
                        items={bakers}
                        className="select-xtz-baker"
                        clickItem={(bakerAddress: DDItemId) =>
                          typeof bakerAddress === 'string' ? updateSelectedBaker(bakersRecord[bakerAddress]) : null
                        }
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* button for depositting more than 1 collateral */}
        <Button
          kind={BUTTON_SIMPLE}
          disabled={!Boolean(nextAvaliableCollateralToAdd)}
          onClick={addNewCollateralHandler}
        >
          + Add more assets as collateral
        </Button>

        <XTZLimitInfoBanner show={willExceedXTZTheLimit} spaces="mt-20" />

        <ModalStatsBlock>
          <div className="block-name">New Vault stats</div>
          <div className="collateral-screen">
            <VaultOverview>
              <div className="line">
                <ThreeLevelListItem>
                  <div className="name">
                    Total Collateral Value
                    <Tooltip>
                      <Tooltip.Trigger className="ml-3">
                        <Icon id="info" />
                      </Tooltip.Trigger>
                      <Tooltip.Content>{COLLATERAL_VALUE}</Tooltip.Content>
                    </Tooltip>
                  </div>
                  <CommaNumber value={collateralsBalance} decimalsToShow={2} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    Borrow Capacity
                    <Tooltip>
                      <Tooltip.Trigger className="ml-3">
                        <Icon id="info" />
                      </Tooltip.Trigger>
                      <Tooltip.Content>{BORROW_CAPACITY}</Tooltip.Content>
                    </Tooltip>
                  </div>
                  <CommaNumber value={borrowCapacity} decimalsToShow={2} className="value" />
                </ThreeLevelListItem>
              </div>
            </VaultOverview>
          </div>
        </ModalStatsBlock>

        <div className="buttons-wrapper" style={{ marginTop: '30px' }}>
          <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backHandler}>
            <Icon id="arrowLeft" />
            Back
          </Button>
          <Button
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={continueHandler}
            disabled={isAddCollateralContinueDisabled}
          >
            Continue
            <Icon id="arrowRight" />
          </Button>
        </div>
      </div>
    </div>
  )
}
