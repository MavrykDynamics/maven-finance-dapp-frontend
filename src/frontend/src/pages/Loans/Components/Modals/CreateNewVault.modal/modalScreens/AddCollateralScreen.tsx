import React, { useMemo } from 'react'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
  isTezosAsset,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { DDItemId, DropDown, DropDownItemType, DropdownInputCustomChild } from 'app/App.components/DropDown/NewDropdown'
import NewButton from 'app/App.components/Button/NewButton'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import Icon from 'app/App.components/Icon/Icon.view'
import { BUTTON_PRIMARY, BUTTON_SIMPLE, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { BORROW_SCREEN_ID } from '../helpers/createNewVault.consts'
import {
  CollateralInputWrapper,
  CollateralScreeenWrapper,
  DeleteCollateralInputIconWrapper,
  ModalStatsBlock,
} from '../createNewVault.style'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import colors from 'styles/colors'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import Button from 'app/App.components/Button/NewButton'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { BORROW_CAPACITY, COLLATERAL_VALUE } from 'texts/tooltips/vault.text'
import { NewVaultType } from '../helpers/createNewVault.types'

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
    isVaultCreating,
    hasXTZTokenSelected,
    newVault,
    borrowCapacity,
  } = useCreateVaultContext()
  const { vaultsMapper } = useVaultsContext()

  const currentVault = vaultsMapper[(newVault as NewVaultType).address]
  const vaultData = useFullVault(currentVault)

  const { collateralBalance = 0 } = vaultData ?? {}

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
  }, [collateralTokens, selectedCollaterals, selectedCollateralsAddresses, tokensMetadata, tokensPrices])

  const nextAvaliableCollateralToAdd = Object.values(mappedAvaliableCollaterals).find(
    ({ disabled, tokenAddress }) => !disabled && !selectedCollateralsAddresses.includes(tokenAddress),
  )

  const isAddCollateralContinueDisabled = Boolean(
    isVaultCreating ||
      (hasXTZTokenSelected && choosenBaker) ||
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

  return (
    <CollateralScreeenWrapper>
      <div>
        <div className="block-name">Select Collateral Asset and Amount</div>
        <div className="collateral-list">
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
                        <CustomTooltip text="Remove collateral asset" className="tooltip">
                          <Button
                            kind={BUTTON_SIMPLE}
                            onClick={() => removeCollateralHandler(selectedCollaterals[collateralAddress].tokenAddress)}
                          >
                            <Icon id="delete" />
                          </Button>
                        </CustomTooltip>
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

        {/* button for depositting more than 1 collateral */}
        <NewButton
          kind={BUTTON_SIMPLE}
          disabled={!Boolean(nextAvaliableCollateralToAdd)}
          onClick={addNewCollateralHandler}
        >
          + Add more assets as collateral
        </NewButton>

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
                  <CommaNumber value={collateralBalance} decimalsToShow={0} className="value" />
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

        <div className="manage-btn">
          <NewButton
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={() => updateScreenToShow(BORROW_SCREEN_ID)}
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
      </div>
    </CollateralScreeenWrapper>
  )
}
