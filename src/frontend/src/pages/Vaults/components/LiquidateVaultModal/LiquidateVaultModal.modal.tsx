import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import Toggle from 'app/App.components/Toggle/Toggle.view'

// styles
import { LiquidateVaultModalStyled } from './LiquidateVaultModal.styles'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'

// helpers
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { calculateAdminLiquidationFee, calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVault'

// types
import { LiquidateVaultDataType } from 'providers/LoansProvider/helpers/LoansModals.types'
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { InputProps } from 'app/App.components/Input/newInput.type'

// actions
import { liquidateVault } from 'pages/Vaults/Vaults.actions'
import { State } from 'reducers'
import { Button } from 'app/App.components/Button/Button.controller'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

const columnWidth = '33%'
const rowHeight = 30

type Props = {
  data: LiquidateVaultDataType
  closePopup: () => void
  show: boolean
}

export const LiquidateVaultModal = ({ data, closePopup, show }: Props) => {
  const { userTokensBalances } = useUserContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { isActionActive } = useSelector((state: State) => state.loading)

  const dispatch = useDispatch()

  const [showAsPercentage, setShowAsPercentage] = useState(true)

  const [inputAmount, setInputAmount] = useState('0')
  const amount = Number(inputAmount)

  const borrowedToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  const {
    vaultId,
    ownerAddress,
    collateralData,
    liquidationMax,
    liquidationReward,
    adminLiquidateFee,
    collateralBalance,
    tokenAddress,
  } = data

  const { symbol, icon, decimals, rate: borrowedTokenRate } = borrowedToken

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

  const handleLiquidateVault = () => {
    if (!vaultId || !ownerAddress || !decimals) return

    dispatch(
      liquidateVault({
        vaultId,
        vaultOwner: ownerAddress,
        liquidateAmount: costToLiquidate,
        decimals: decimals,
      }),
    )
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
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="vaults">
        <LiquidateVaultModalStyled showAsPercentage={showAsPercentage}>
          <button onClick={closePopup} className="close-modal" />
          <h1>Liquidate Vault</h1>
          <p>
            Foreclosing (liquidating) a vault repays the vault’s debt, by purchasing the vault’s collateral. Liquidators
            earn an additional 10% yield on top of the debt repaid for helping to secure Mavryk’s lending. Foreclosing
            on a vault requires repaying the vault debt in the same asset. The most that can be liquidated from a vault
            is 50%. Input a percentage and then review your liquidation details below.
          </p>

          <div className="flex-group">
            <div>
              <div className="v-centering-group">
                Liquidation Max
                <Icon id="info" className="info-icon" />
              </div>
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
            className="toggle"
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
              <div className="v-centering-group">
                Treasury Fee
                <Icon id="info" className="info-icon" />
              </div>
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
                    const { symbol } = tokensMetadata[tokenAddress]
                    const isTotalRow = collateralData.length - 1 === index

                    const collateralShare = isTotalRow
                      ? 100
                      : calculateCollateralShare(amount * borrowedTokenRate, collateralBalance)

                    return (
                      <TableRow rowHeight={rowHeight} key={symbol + '-' + index}>
                        <TableCell width={columnWidth}>{symbol}</TableCell>

                        <TableCell width={columnWidth}>
                          <div className="table-amount-group">
                            <div>{collateralShare}%</div>
                            <CommaNumber value={amount} decimalsToShow={2} showDecimal />
                          </div>
                        </TableCell>

                        <TableCell width={columnWidth} contentPosition="right">
                          <CommaNumber
                            value={borrowedTokenRate ? amount * borrowedTokenRate : 0}
                            decimalsToShow={2}
                            showDecimal
                            beginningText="$"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  <TableRow rowHeight={rowHeight}>
                    <TableCell width={columnWidth}>Total</TableCell>
                    <TableCell width={columnWidth}></TableCell>
                    <TableCell width={columnWidth} contentPosition="right">
                      <CommaNumber
                        value={collateralData[collateralData.length - 1].amount}
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
