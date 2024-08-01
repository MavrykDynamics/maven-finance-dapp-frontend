import React, { useCallback, useEffect, useMemo, useState } from 'react'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import Toggle from 'app/App.components/Toggle/Toggle.view'
import { LiquidateVaultModalStyled } from './LiquidateVaultModal.styles'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import Button from 'app/App.components/Button/NewButton'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import Icon from 'app/App.components/Icon/Icon.view'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

// consts
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  INPUT_LARGE,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { LIQUIDATE_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { SECONDARY_TOGGLE } from 'app/App.components/Toggle/Toggle.consts'

// types
import { LiquidateVaultDataType } from 'providers/LoansProvider/helpers/LoansModals.types'
import { InputProps, InputSettings } from 'app/App.components/Input/newInput.type'

// utils
import { calcPercent, convertNumberForClient } from 'utils/calcFunctions'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { calculateCollateralShare } from 'providers/VaultsProvider/helpers/vaults.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { liquidateVault } from 'providers/VaultsProvider/actions/vaultsLiquidation.actions'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

const columnWidth = '33%'
const rowHeight = 30

type Props = {
  data: LiquidateVaultDataType
  closePopup: () => void
  show: boolean
}

export const LiquidateVaultModal = ({ data, closePopup, show }: Props) => {
  const { userTokensBalances, userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    contractAddresses: { lendingControllerAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const {
    collateralData,
    liquidationMax,
    liquidationRewardCoefficient,
    adminLiquidateFeeCoefficient,
    collateralBalance,
    tokenAddress,
  } = data

  const borrowedToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
  const userBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress })

  const [isUsingPersent, setIsUsingPersent] = useState(true)
  const [inputTokenAmount, setInputTokenAmount] = useState('0')
  const [inputPercentageAmount, setInputPersentageAmount] = useState('0')

  // effect to reset popup input on popup close
  useEffect(() => {
    if (!show) {
      setIsUsingPersent(true)
      setInputTokenAmount('0')
      setInputPersentageAmount('0')
    }
  }, [show])

  /**
   * safe converted input strings to numbers
   */
  const inputTokenAmountConvertedToNumber = isNaN(parseFloat(inputTokenAmount)) ? 0 : parseFloat(inputTokenAmount)
  const inputPersentConvertedToNumber = isNaN(parseFloat(inputPercentageAmount)) ? 0 : parseFloat(inputPercentageAmount)

  // tokens amount of user input (% is converted to tokens amount)
  const enteredLiquidationTokensAmount = isUsingPersent
    ? (liquidationMax / 100) * inputPersentConvertedToNumber
    : Math.min(inputTokenAmountConvertedToNumber, liquidationMax)

  /**
   * values converted to USD
   */
  const liquidationMaxUsd = liquidationMax * (borrowedToken?.rate ?? 0)
  const enteredLiquidationTokensUsdAmount = enteredLiquidationTokensAmount * (borrowedToken?.rate ?? 0)

  /**
   * input max and min values for token amount and persentage inputs
   */
  const maxInputTokensAmount = userBalance // max amount is min from user balance or liquidation max
  const minInputTokensAmount = Math.min(1, liquidationMax) // min amount is 1 token
  const maxInputPercentageAmount = 100 // max amount is 100%
  const minInputPercentageAmount = Math.max(1, calcPercent(minInputTokensAmount, liquidationMax)) // min amount is max from 1% and % of 1 token from liquidation max
  const inputUseMaxAmount = Math.min(userBalance, liquidationMax)

  /**
   * liquidation reward values
   */
  const liquidationRewardPersent = liquidationRewardCoefficient * 100
  const liquidationRewardTokensAmount = enteredLiquidationTokensAmount * liquidationRewardCoefficient
  const liquidationRewardUsdAmount = liquidationRewardTokensAmount * (borrowedToken?.rate ?? 0)
  const maxLiquidationRewardUsdAmount = liquidationMax * liquidationRewardCoefficient * (borrowedToken?.rate ?? 0)

  /**
   * treasury fee values
   */
  const treasuryFeeTokensAmount = enteredLiquidationTokensAmount * adminLiquidateFeeCoefficient
  const treasuryFeeUsdAmount = treasuryFeeTokensAmount * (borrowedToken?.rate ?? 0)

  const returnedToLiquidatorUsd = enteredLiquidationTokensUsdAmount + liquidationRewardUsdAmount
  const profitUsdAmount = Math.max(0, liquidationRewardUsdAmount)
  const collateralWithdrawn = enteredLiquidationTokensUsdAmount + profitUsdAmount + treasuryFeeUsdAmount

  const receivedCollaterals = collateralData.reduce<
    Array<{
      symbol: string
      amount: number
      usdAmount: number
      share: number
    }>
  >((acc, collateral) => {
    const collateralToken = getTokenDataByAddress({
      tokenAddress: collateral.tokenAddress,
      tokensMetadata,
      tokensPrices,
    })

    if (!collateralToken || !collateralToken.rate) return acc

    const vaultCollateralAmount = convertNumberForClient({
      number: collateral.amount,
      grade: collateralToken.decimals,
    })
    const vaultCollateralUsdAmount = vaultCollateralAmount * collateralToken.rate

    const collateralReceivedUsdAmount = (returnedToLiquidatorUsd * vaultCollateralUsdAmount) / collateralBalance
    const collateralReceivedAmount = collateralReceivedUsdAmount / collateralToken.rate

    acc.push({
      symbol: collateralToken.symbol,
      amount: collateralReceivedAmount,
      usdAmount: collateralReceivedUsdAmount,
      share:
        collateralReceivedUsdAmount === 0
          ? 0
          : calculateCollateralShare(collateralReceivedUsdAmount, returnedToLiquidatorUsd),
    })
    return acc
  }, [])

  /**
   * liquidation contract action
   */
  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: LIQUIDATE_VAULT_ACTION,
      successActionCallback: () => {
        closePopup()
      },
      actionFn: async () => {
        if (!borrowedToken || !checkWhetherTokenIsLoanToken(borrowedToken)) {
          return null
        }

        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!lendingControllerAddress) {
          bug('Wrong lending address')
          return null
        }

        return await liquidateVault(
          data.vaultId,
          data.vaultAddress,
          data.userAddress,
          data.ownerAddress,
          Number(enteredLiquidationTokensAmount),
          borrowedToken,
          lendingControllerAddress,
        )
      },
    }),
    [
      borrowedToken,
      userAddress,
      lendingControllerAddress,
      data.vaultId,
      data.vaultAddress,
      data.userAddress,
      data.ownerAddress,
      enteredLiquidationTokensAmount,
      bug,
    ],
  )

  const { action: handleLiquidateVault } = useContractAction(contractActionProps)

  /**
   * input status calculations
   */
  const handleInputStatus = useCallback((inputValue: number, maxValue: number, minValue: number): InputStatusType => {
    if (inputValue === 0) return ''

    if (inputValue > maxValue || inputValue < minValue) return INPUT_STATUS_ERROR

    return INPUT_STATUS_SUCCESS
  }, [])

  /**
   * input use max btn handler
   */
  const handleInputUseMax = useCallback(() => {
    if (isUsingPersent) {
      setInputPersentageAmount(String(maxInputPercentageAmount))
    } else {
      setInputTokenAmount(String(inputUseMaxAmount))
    }
  }, [isUsingPersent, inputUseMaxAmount])

  /**
   * input change handler
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isUsingPersent) {
        setInputPersentageAmount(e.target.value)
      } else {
        setInputTokenAmount(e.target.value)
      }
    },
    [isUsingPersent],
  )

  /**
   * input focus handler to clear input from default value
   */
  const handleInputFocus = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isUsingPersent && e.target.value === '0') {
        setInputPersentageAmount('')
      }

      if (!isUsingPersent && e.target.value === '0') {
        setInputTokenAmount('')
      }
    },
    [isUsingPersent],
  )

  /**
   * input blur handler to set default value if input is empty
   */
  const handleInputBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isUsingPersent && e.target.value === '') {
        setInputPersentageAmount('0')
      }

      if (!isUsingPersent && e.target.value === '') {
        setInputTokenAmount('0')
      }
    },
    [isUsingPersent],
  )

  /**
   * change input enter mode handler
   */
  const handleToggle = useCallback(() => {
    setIsUsingPersent((prev) => !prev)
  }, [])

  const inputProps = useMemo<InputProps>(() => {
    return {
      value: isUsingPersent ? inputPercentageAmount : inputTokenAmount,
      type: 'number',
      onChange: handleInputChange,
      onFocus: handleInputFocus,
      onBlur: handleInputBlur,
    }
  }, [handleInputBlur, handleInputChange, handleInputFocus, inputPercentageAmount, inputTokenAmount, isUsingPersent])

  const inputSettings = useMemo<InputSettings>(() => {
    return {
      balance: userBalance,
      balanceAsset: borrowedToken?.symbol,
      useMaxHandler: handleInputUseMax,
      inputStatus: handleInputStatus(
        isUsingPersent ? inputPersentConvertedToNumber : inputTokenAmountConvertedToNumber,
        isUsingPersent ? maxInputPercentageAmount : maxInputTokensAmount,
        isUsingPersent ? minInputPercentageAmount : minInputTokensAmount,
      ),
      convertedValue: enteredLiquidationTokensUsdAmount,
      inputSize: INPUT_LARGE,
    }
  }, [
    userBalance,
    borrowedToken?.symbol,
    handleInputUseMax,
    handleInputStatus,
    isUsingPersent,
    inputPersentConvertedToNumber,
    inputTokenAmountConvertedToNumber,
    maxInputTokensAmount,
    minInputPercentageAmount,
    minInputTokensAmount,
    enteredLiquidationTokensUsdAmount,
  ])

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  return (
    <PopupContainer onClick={closePopup} $show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="vaults">
        <LiquidateVaultModalStyled>
          <button onClick={closePopup} className="close-modal" />

          <h1>Liquidate Vault</h1>

          <p className="popup-description">
            Foreclosing (liquidating) a vault repays the vault’s debt, by purchasing the vault’s collateral. Liquidators
            earn an additional 10% yield on top of the debt repaid for helping to secure Maven’s lending. Foreclosing on
            a vault requires repaying the vault debt in the same asset. The most that can be liquidated from a vault is
            50%. Input a percentage and then review your liquidation details below.
          </p>

          <div className="stats-row">
            <div className="cell">
              <div className="title">
                Liquidation Max{' '}
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    The max amount that can be liquidated from the vault which is 50% of the vault’s debt.
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <CommaNumber
                value={liquidationMaxUsd}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>

            <div className="cell">
              <div className="title">Liquidation Reward</div>
              <CommaNumber
                value={liquidationRewardPersent}
                decimalsToShow={2}
                showDecimal
                endingText="%"
                className="numberColor"
              />
            </div>

            <div className="cell">
              <div className="title">Max Profit</div>
              <CommaNumber
                value={maxLiquidationRewardUsdAmount}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <div className="input-title">
              {isUsingPersent ? 'Input percent you want to liquidate' : 'Input liquidation Amount'}
            </div>
            <Input className={`input-with-rate`} inputProps={inputProps} settings={inputSettings}>
              <InputPinnedTokenInfo>
                <div className="input-unit">
                  {isUsingPersent ? (
                    <span>%</span>
                  ) : (
                    <ImageWithPlug imageLink={borrowedToken.icon} alt={`${borrowedToken.symbol} logo`} />
                  )}
                </div>
              </InputPinnedTokenInfo>
            </Input>
            <div className="toggle-wrapper">
              <Toggle
                kind={SECONDARY_TOGGLE}
                prefix={borrowedToken.symbol}
                sufix={'Percent'}
                checked={isUsingPersent}
                onChange={handleToggle}
              />
            </div>
          </div>

          <hr />

          <div className="stats-wrapper">
            <h3>Your Liquidation Summary</h3>

            <div className="stats-grid">
              <div className="cell">
                <div className="title">Cost to Liquidate</div>
                <CommaNumber
                  value={enteredLiquidationTokensUsdAmount}
                  decimalsToShow={2}
                  showDecimal
                  beginningText="$"
                  className="numberColor"
                />
              </div>

              {/* Commented cuz it hold same value as profit */}
              {/* <div className="cell">
                <div className="title">Liquidation Reward</div>
                <CommaNumber
                  value={liquidationRewardUsdAmount}
                  decimalsToShow={2}
                  showDecimal
                  beginningText="$"
                  className="numberColor"
                />
              </div> */}

              <div className="cell">
                <div className="title">Returned to Liquidator</div>
                <CommaNumber
                  value={returnedToLiquidatorUsd}
                  decimalsToShow={2}
                  showDecimal
                  beginningText="$"
                  className="numberColor"
                />
              </div>

              <div className="cell">
                <div className="title">Collateral Withdrawn</div>
                <CommaNumber
                  value={collateralWithdrawn}
                  decimalsToShow={2}
                  showDecimal
                  beginningText="$"
                  className="numberColor"
                />
              </div>

              <div className="cell">
                <div className="title">Profit</div>
                <CommaNumber
                  value={profitUsdAmount}
                  decimalsToShow={2}
                  showDecimal
                  beginningText="$"
                  className={profitUsdAmount > 0 ? 'upColor' : 'numberColor'}
                />
              </div>

              <div className="cell">
                <div className="title">Treasury Fee</div>
                <CommaNumber
                  value={treasuryFeeUsdAmount}
                  decimalsToShow={2}
                  showDecimal
                  beginningText="$"
                  className="numberColor"
                />
              </div>
            </div>
          </div>

          <div className="vault-assets-wrapper">
            <h4>Assets Received</h4>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Asset</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {receivedCollaterals.map(({ symbol, amount, usdAmount, share }, index) => {
                  return (
                    <TableRow $rowHeight={rowHeight} $borderColor="primaryText" key={symbol + '-' + index}>
                      <TableCell $width={columnWidth}>{symbol}</TableCell>

                      <TableCell $width={columnWidth}>
                        <div className="table-amount-group">
                          <div>{share}%</div>
                          <CommaNumber value={amount} decimalsToShow={2} showDecimal className="numberColor" />
                        </div>
                      </TableCell>

                      <TableCell $width={columnWidth} $contentPosition="right">
                        <CommaNumber
                          value={usdAmount}
                          decimalsToShow={2}
                          showDecimal
                          beginningText="$"
                          className="numberColor"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}

                <TableRow $rowHeight={rowHeight}>
                  <TableCell $width={columnWidth}>Total</TableCell>
                  <TableCell $width={columnWidth}></TableCell>
                  <TableCell $width={columnWidth} $contentPosition="right">
                    <CommaNumber
                      value={returnedToLiquidatorUsd}
                      decimalsToShow={2}
                      showDecimal
                      beginningText="$"
                      className="upColor"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="liquidation-btn-wrapper">
            <Button
              kind={BUTTON_PRIMARY}
              disabled={!enteredLiquidationTokensAmount || isActionActive}
              onClick={handleLiquidateVault}
            >
              Liquidate
            </Button>
          </div>
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
