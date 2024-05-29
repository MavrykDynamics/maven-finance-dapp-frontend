import React, { useMemo, useState } from 'react'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import Toggle from 'app/App.components/Toggle/Toggle.view'
import { LiquidateVaultModalStyled } from './LiquidateVaultModal.styles'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { Button } from 'app/App.components/Button/Button.controller'

// consts
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { LIQUIDATE_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { SECONDARY_TOGGLE } from 'app/App.components/Toggle/Toggle.consts'

// types
import { LiquidateVaultDataType } from 'providers/LoansProvider/helpers/LoansModals.types'
import { InputProps } from 'app/App.components/Input/newInput.type'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { calculateAdminLiquidationFee, calculateCollateralShare } from 'providers/VaultsProvider/helpers/vaults.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { liquidateVault } from 'providers/VaultsProvider/actions/vaultsLiquidation.actions'

// hooks
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

// TODO: need to test values here, don't have valid vault for it
// TODO: test and do this as other loans popups, when we will be able to liq vaults
export const LiquidateVaultModal = ({ data, closePopup, show }: Props) => {
  const { userTokensBalances, userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    contractAddresses: { lendingControllerAddress },
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()

  const [showAsPercentage, setShowAsPercentage] = useState(true)

  const [inputAmount, setInputAmount] = useState('0')
  const amount = Number(inputAmount)

  const borrowedToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: LIQUIDATE_VAULT_ACTION,
      actionFn: async () => {
        if ((borrowedToken && !checkWhetherTokenIsLoanToken(borrowedToken)) || !borrowedToken) {
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
          data.ownerAddress,
          Number(inputAmount),
          borrowedToken,
          lendingControllerAddress,
        )
      },
    }),
    [borrowedToken, inputAmount, lendingControllerAddress, data.ownerAddress, userAddress, data.vaultId],
  )

  const { action: handleLiquidateVault } = useContractAction(contractActionProps)

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  const { collateralData, liquidationMax, liquidationReward, adminLiquidateFee, collateralBalance, tokenAddress } = data
  const { symbol, icon, rate: borrowedTokenRate } = borrowedToken

  const userBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress })

  const liquidationMaxTokens = liquidationMax / borrowedTokenRate
  const liquidationRewardPercentage = liquidationReward * 100
  const maxProfit = liquidationMax * liquidationReward

  const useMaxBalance = showAsPercentage
    ? 100
    : userBalance >= liquidationMaxTokens
    ? liquidationMaxTokens
    : userBalance

  const costToLiquidatePercentage = (liquidationMax / 100) * amount
  const costToLiquidateAsset = amount * borrowedTokenRate

  const costToLiquidate = showAsPercentage ? costToLiquidatePercentage : costToLiquidateAsset
  const returnedToLiquidator = costToLiquidate + costToLiquidate * liquidationReward

  const profit = costToLiquidate * liquidationReward
  const treasuryFee = calculateAdminLiquidationFee(adminLiquidateFee, costToLiquidate)
  const collateralWithdrawn = costToLiquidate + profit + treasuryFee

  const handleInputStatus = (inputValue: number, maxValue: number): InputStatusType => {
    if (inputValue === 0) return ''

    return inputValue > maxValue ? INPUT_STATUS_ERROR : INPUT_STATUS_SUCCESS
  }

  const handleToggle = () => {
    setInputAmount('0')
    setShowAsPercentage(!showAsPercentage)
  }

  const inputProps: InputProps = {
    value: inputAmount,
    type: 'number',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputAmount(e.target.value),
  }

  const inputSettings = {
    balance: userBalance,
    balanceAsset: symbol,
    useMaxHandler: () => setInputAmount(String(useMaxBalance)),
    inputStatus: handleInputStatus(costToLiquidate, liquidationMax),
    convertedValue: costToLiquidate,
  }

  return (
    <PopupContainer onClick={closePopup} $show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="vaults">
        <LiquidateVaultModalStyled showAsPercentage={showAsPercentage}>
          <button onClick={closePopup} className="close-modal" />
          <h1>Liquidate Vault</h1>
          <p>
            Foreclosing (liquidating) a vault repays the vault’s debt, by purchasing the vault’s collateral. Liquidators
            earn an additional 10% yield on top of the debt repaid for helping to secure Maven’s lending. Foreclosing on
            a vault requires repaying the vault debt in the same asset. The most that can be liquidated from a vault is
            50%. Input a percentage and then review your liquidation details below.
          </p>

          <div className="flex-group">
            <div>
              <div className="v-centering-group">Liquidation Max</div>
              <CommaNumber
                value={liquidationMax}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>

            <div>
              <div>Liquidation Reward</div>
              <CommaNumber value={liquidationRewardPercentage} endingText="%" className="numberColor" />
            </div>

            <div>
              <div>Max Profit</div>
              <CommaNumber value={maxProfit} decimalsToShow={2} showDecimal beginningText="$" className="numberColor" />
            </div>
          </div>

          <div className="input-title">
            {showAsPercentage ? 'Input percent you want to liquidate' : 'Input Liquidation Amount'}
          </div>

          <Input className="input" inputProps={inputProps} settings={inputSettings}>
            <InputPinnedTokenInfo>
              {showAsPercentage ? (
                '%'
              ) : (
                <>
                  {icon ? (
                    <div className="img-wrapper">
                      <img src={icon} alt={`${symbol} logo`} />
                    </div>
                  ) : (
                    <div className="no-icon">
                      <Icon id="noImage" />
                    </div>
                  )}
                </>
              )}
            </InputPinnedTokenInfo>
          </Input>

          <Toggle
            kind={SECONDARY_TOGGLE}
            prefix={symbol}
            sufix={'Percent'}
            checked={showAsPercentage}
            onChange={handleToggle}
          />

          <hr />

          <h1 className="without-underscore">Your Liquidation Summary</h1>

          <div className="grid-group">
            <div>
              Cost to Liquidate
              <CommaNumber
                value={costToLiquidate}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor "
              />
            </div>
            <div>
              Liquidation Reward
              <CommaNumber
                value={liquidationRewardPercentage}
                decimalsToShow={2}
                showDecimal
                endingText="%"
                className="numberColor"
              />
            </div>
            <div>
              Returned to Liquidator
              <CommaNumber
                value={returnedToLiquidator}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>
            <div>
              Profit
              <CommaNumber value={profit} decimalsToShow={2} showDecimal beginningText="$" className="upColor" />
            </div>
            <div>
              <div className="v-centering-group">Treasury Fee</div>
              <CommaNumber
                value={treasuryFee}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>
            <div>
              Collateral Withdrawn
              <CommaNumber
                value={collateralWithdrawn}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>
          </div>

          {Boolean(collateralData.length) && (
            <>
              <h2>Assets Received</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Asset</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {collateralData.slice(0, -1).map(({ tokenAddress, amount }, index) => {
                    const collateralToken = getTokenDataByAddress({
                      tokenAddress,
                      tokensMetadata,
                      tokensPrices,
                    })

                    if (!collateralToken || !collateralToken.rate) return null

                    const { symbol, icon, rate, decimals } = collateralToken

                    const convertedAmount = convertNumberForClient({
                      number: amount,
                      grade: decimals,
                    })
                    const collateralShare = calculateCollateralShare(convertedAmount * rate, collateralBalance)

                    return (
                      <TableRow $rowHeight={rowHeight} $borderColor="primaryText" key={symbol + '-' + index}>
                        <TableCell $width={columnWidth}>{symbol}</TableCell>

                        <TableCell $width={columnWidth}>
                          <div className="table-amount-group">
                            <div>{collateralShare}%</div>
                            <CommaNumber value={convertedAmount} decimalsToShow={2} showDecimal />
                          </div>
                        </TableCell>

                        <TableCell $width={columnWidth} $contentPosition="right">
                          <CommaNumber
                            value={convertedAmount * rate}
                            decimalsToShow={2}
                            showDecimal
                            beginningText="$"
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
                        value={collateralBalance}
                        decimalsToShow={2}
                        showDecimal
                        beginningText="$"
                        className="upColor"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}

          <div className="g-centering-group">
            <Button
              text="Liquidate"
              kind={ACTION_PRIMARY}
              disabled={!costToLiquidate || isActionActive}
              onClick={handleLiquidateVault}
            />
          </div>
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
