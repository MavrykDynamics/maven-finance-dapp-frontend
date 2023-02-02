import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import Toggle from 'app/App.components/Toggle/Toggle.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// styles
import { LiquidateVaultModalStyled } from './LiquidateVaultModal.styles'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'

// helpers
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'

// types
import { LiquidateVaultDataType } from 'pages/Loans/Components/Modals/Modals.helpers'
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// actions
import { liquidateVault } from 'pages/Vaults/Vaults.actions'
import { getAssetDisplayName } from 'pages/Loans/Loans.helpers'

const columnWidth = '33%'
const rowHeight = 30

type Props = {
  data: LiquidateVaultDataType
  closePopup: () => void
  show: boolean
}

export const LiquidateVaultModal = ({ data, closePopup, show }: Props) => {
  const dispatch = useDispatch()

  const { vaultId, ownerId, borrowedAsset, borrowedAmount = 0, collateralData = [] } = data ?? {}

  const { symbol = '', icon = '', rate = 0, userBalance = 0 } = borrowedAsset ?? {}

  const [inputAmount, setInputAmount] = useState('0')
  const [showAsPercentage, setShowAsPercentage] = useState(true)

  const amount = Number(inputAmount)
  const liquidationMaxAsset = borrowedAmount / 2
  const liquidationMaxUsd = (borrowedAmount / 2) * rate

  const liquidationReward = 10
  const maxProfit = (liquidationMaxUsd / 100) * liquidationReward

  const useMaxBalance = showAsPercentage ? 100 : userBalance >= liquidationMaxAsset ? liquidationMaxAsset : userBalance

  const costToLiquidatePercentage = (liquidationMaxUsd / 100) * amount
  const costToLiquidateAsset = amount * rate

  const costToLiquidate = showAsPercentage ? costToLiquidatePercentage : costToLiquidateAsset

  const liquidationRewardResult = (costToLiquidate / 100) * liquidationReward
  const returnedToLiquidator = costToLiquidate + liquidationRewardResult

  const profit = 1234.44 // TODO: use valid data

  const handleInputStatus = (inputValue: number, maxValue: number): InputStatusType => {
    if (inputValue === 0) return ''

    return inputValue > maxValue ? INPUT_STATUS_ERROR : INPUT_STATUS_SUCCESS
  }

  const handleToggle = () => {
    setInputAmount('0')
    setShowAsPercentage(!showAsPercentage)
  }

  const handleLiquidateVault = (data: { vaultId?: number; ownerId?: string; costToLiquidate: number }) => {
    const { vaultId, ownerId, costToLiquidate } = data

    if (!vaultId || !ownerId) return

    dispatch(liquidateVault(vaultId, ownerId, costToLiquidate))
  }

  const inputProps = {
    value: inputAmount,
    type: 'number',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputAmount(e.target.value),
  }

  const inputSettings = {
    balance: userBalance,
    balanceAsset: symbol,
    useMaxHandler: () => setInputAmount(String(useMaxBalance)),
    inputStatus: handleInputStatus(costToLiquidate, liquidationMaxUsd),
    convertedValue: costToLiquidate,
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
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
                value={liquidationMaxUsd}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
                className="numberColor"
              />
            </div>

            <div>
              <div>Liquidation Reward</div>
              <CommaNumber value={liquidationReward} endingText="%" className="numberColor" />
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
                value={liquidationRewardResult}
                decimalsToShow={2}
                showDecimal
                beginningText="$"
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
              <CommaNumber value={500.0} decimalsToShow={2} showDecimal beginningText="$" className="numberColor" />
            </div>
            <div>
              Collateral Withdrawn
              <CommaNumber value={50000.0} decimalsToShow={2} showDecimal beginningText="$" className="numberColor" />
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
                  {collateralData.slice(0, -1).map(({ gqlName, collateralShare, amount, rate }, index) => {
                    return (
                      <TableRow rowHeight={rowHeight} key={gqlName + '-' + index}>
                        <TableCell width={columnWidth}>{getAssetDisplayName(gqlName)}</TableCell>

                        <TableCell width={columnWidth}>
                          <div className="table-amount-group">
                            <div>{collateralShare}%</div>
                            <CommaNumber value={amount} decimalsToShow={2} showDecimal />
                          </div>
                        </TableCell>

                        <TableCell width={columnWidth} contentPosition="right">
                          <CommaNumber
                            value={rate ? amount * rate : 0}
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
              disabled={!costToLiquidate}
              onClick={() => handleLiquidateVault({ vaultId, ownerId, costToLiquidate })}
            />
          </div>
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
