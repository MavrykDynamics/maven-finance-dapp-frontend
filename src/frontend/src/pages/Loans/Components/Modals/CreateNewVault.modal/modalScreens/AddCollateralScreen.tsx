import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'

// providers
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// utils
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
import { DDItemId, DropDown, DropDownItemType, DropdownInputCustomChild } from 'app/App.components/DropDown/NewDropdown'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// styles
import colors from 'styles/colors'
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
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { CONFIRM_STATS_SCREEN_ID, INITIAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import { BORROW_CAPACITY, COLLATERAL_VALUE } from 'texts/tooltips/vault.text'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { MemoizedComponent } from 'app/App.HOC/MemoizedComponent'
import { validateInputLength } from 'app/App.utils/input/validateInput'

export const AddCollateralScreen = () => {
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()
  const { userTokensBalances } = useUserContext()

  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { bakers, choosenBaker, setChoosenBaker } = useXtzBakersForDD()
  const {
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateSelectedCollaterals,
    updateScreenToShow,
    hasXTZTokenSelected,
    borrowCapacity,
    collateralsBalance,
  } = useCreateVaultContext()

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
          collateral.loanData.isPausedCollateral || selectedCollaterals[collateralTokenAddress],
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
      updateSelectedCollaterals({
        [firstNotDisabledCollateralAddress]: {
          tokenAddress: firstNotDisabledCollateralAddress,
          amount: '0',
          validation: INPUT_STATUS_DEFAULT,
        },
      })
    }

    return reducedCollaterals
  }, [collateralTokens, selectedCollaterals, selectedCollateralsAddresses.length, tokensMetadata, tokensPrices])

  const nextAvaliableCollateralToAdd = Object.values(mappedAvaliableCollaterals).find(
    ({ disabled, tokenAddress }) => !disabled && !selectedCollateralsAddresses.includes(tokenAddress),
  )

  const isAddCollateralContinueDisabled = Boolean(
    (hasXTZTokenSelected && !choosenBaker) ||
      !selectedCollateralsAddresses.every((tokenAddress) => {
        return selectedCollaterals[tokenAddress].validation === INPUT_STATUS_SUCCESS
      }),
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
    const validationStatus = loansInputValidation({
      inputAmount: newInputAmount,
      maxAmount: userCollateralBalance,
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

  // collateral-list-overflow
  const isContainingTwoCollaterals = selectedCollateralsAddresses.length > 2

  return (
    <div>
      <div>
        <div className="block-name">Select Collateral Asset and Amount</div>
        <div className={classNames({ 'collateral-list-wrapper-for-overflow': isContainingTwoCollaterals })}>
          <div
            className={classNames('collateral-list', 'scroll-block', {
              'collateral-list-overflow': isContainingTwoCollaterals,
              // 'mb-20': isContainingTwoCollaterals,
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
                        activeItem={choosenBaker}
                        items={bakers}
                        className="select-xtz-baker"
                        clickItem={(bakerAddress: DDItemId) =>
                          typeof bakerAddress === 'string' ? setChoosenBaker(bakerAddress) : null
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

        <MemoizedComponent returnMemoizedComponent={isAddCollateralContinueDisabled}>
          <ModalStatsBlock>
            <div className="block-name">New Vault stats</div>
            <div className="collateral-screen">
              <VaultOverview>
                <div className="line">
                  <ThreeLevelListItem>
                    <div className="name">
                      Total Collateral Value
                      <CustomTooltip
                        iconId="info"
                        defaultStrokeColor={colors[themeSelected].textColor}
                        text={COLLATERAL_VALUE}
                        className="tooltip"
                      />
                    </div>
                    <CommaNumber value={collateralsBalance} decimalsToShow={0} className="value" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">
                      Borrow Capacity
                      <CustomTooltip
                        iconId="info"
                        defaultStrokeColor={colors[themeSelected].textColor}
                        text={BORROW_CAPACITY}
                        className="tooltip"
                      />
                    </div>
                    <CommaNumber value={borrowCapacity} decimalsToShow={0} className="value" />
                  </ThreeLevelListItem>
                </div>
              </VaultOverview>
            </div>
          </ModalStatsBlock>
        </MemoizedComponent>

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
