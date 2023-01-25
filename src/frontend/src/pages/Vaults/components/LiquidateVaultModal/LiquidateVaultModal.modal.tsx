import React, { useState } from "react";

// components
import { CommaNumber } from "app/App.components/CommaNumber/CommaNumber.controller";
import Icon from "app/App.components/Icon/Icon.view";
import { Input } from "app/App.components/Input/NewInput";
import { InputPinnedTokenInfo } from "app/App.components/Input/Input.style";
import Toggle from "app/App.components/Toggle/Toggle.view";
import { Button } from "app/App.components/SettingsPopup/SettingsPopup.style";

// styles
import { LiquidateVaultModalStyled } from "./LiquidateVaultModal.styles";
import { PopupContainer, PopupContainerWrapper } from "app/App.components/SettingsPopup/SettingsPopup.style";

// helpers
import { ACTION_PRIMARY } from "app/App.components/Button/Button.constants";
import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR } from "app/App.components/Input/Input.constants";

// types
import { VaultType } from "utils/TypesAndInterfaces/Vaults";

//===================================
// TODO: hardcode data
const balance = 20000
const profit = 1234.44
//===================================

type Props = VaultType & {
  handleLiquidateVault: (vaultId: number, vaultOwner: string, liquidateAmount: number) => void
  closePopup: () => void
  show: boolean 
}

export const LiquidateVaultModal = (props: Props) => {
  const {
    vaultId,
    ownerId,
    handleLiquidateVault,
    closePopup,
    show,
    borrowedAsset: { amtBorrowed, assetSymbol, assetIcon, assetRate: rate },
    collateralData,
  } = props
  const [inputAmount, setInputAmount] = useState('0')
  const [showAsPercentage, setShowAsPercentage] = useState(true)
  const assetRate = rate || 1

  const liquidationMax = 8000 / 2 // TODO: use amtBorrowed intead of 8000
  const liquidationReward = 10
  const maxProfit = liquidationMax / 100 * liquidationReward

  const amount = Number(inputAmount)
  const useMaxBalance = balance >= liquidationMax ? liquidationMax : balance

  const costToLiquidate = showAsPercentage
    ? liquidationMax / 100 * amount * assetRate
    : amount * assetRate

  const liquidationRewardResult = costToLiquidate / 100 * liquidationReward
  const returnedToLiquidator = costToLiquidate + liquidationRewardResult

  const handleInputStatus = (inputValue: number, maxValue: number) => {
    if (inputValue === 0) return ''

    return inputValue > maxValue ? INPUT_STATUS_ERROR : INPUT_STATUS_SUCCESS
  }

  const handleToggle = () => {
    setInputAmount('0')
    setShowAsPercentage(!showAsPercentage)
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LiquidateVaultModalStyled showAsPercentage={showAsPercentage}>
          <button onClick={closePopup} className="close-modal" />
          <h1>Liquidate Vault</h1>
          <p>
            Foreclosing (liquidating) a vault repays the vault’s debt, by purchasing the vault’s collateral.
            Liquidators earn an additional 10% yield on top of the debt repaid for helping to secure Mavryk’s lending.
            Foreclosing on a vault requires repaying the vault debt in the same asset.
            The most that can be liquidated from a vault is 50%.
            Input a percentage and then review your liquidation details below.
          </p>

          <div className="flex-group">
            <div>
              <div className="v-centering-group">
                Liquidation Max
                <Icon id='info' className='info-icon' /> 
              </div>
              <CommaNumber value={liquidationMax} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>

            <div>
              <div>Liquidation Reward</div>
              <CommaNumber value={liquidationReward} endingText='%' className='numberColor'/>
            </div>
            
            <div>
              <div>Max Profit</div>
              <CommaNumber value={maxProfit} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
          </div>

          <div className="input-title">
            {showAsPercentage ? 'Input percent you want to liquidate' : 'Input Liquidation Amount'}
          </div>

          <Input
            className='input'
            inputProps={{
              value: inputAmount,
              type: 'number',
              onChange: (e) => setInputAmount(e.target.value),
            }}
            settings={{
              balance: balance,
              balanceAsset: assetSymbol,
              useMaxHandler: () => setInputAmount(String(useMaxBalance)),
              inputStatus: handleInputStatus(costToLiquidate, liquidationMax),
              convertedValue: costToLiquidate,
            }}
          >
            <InputPinnedTokenInfo>
              {showAsPercentage
                ? '%' 
                : <>
                    {assetIcon ? (
                      <div className="img-wrapper">
                        <img src={assetIcon} alt={`${assetSymbol} logo`} />
                      </div>
                    ) : (
                      <div className="no-icon">
                        <Icon id="noImage" />
                      </div>
                    )}
                  </>}
            </InputPinnedTokenInfo>
          </Input>

          <Toggle
            className="toggle"
            prefix={'USDt'}
            sufix={'Percent'}
            checked={showAsPercentage}
            onChange={handleToggle}
          />

          <hr />

          <h1 className="without-underscore">Your Liquidation Summary</h1>

          <div className="grid-group">
            <div>
              Cost to Liquidate
              <CommaNumber value={costToLiquidate} decimalsToShow={2} showDecimal beginningText='$' className='numberColor '/>
            </div>
            <div>
              Liquidation Reward
              <CommaNumber value={liquidationRewardResult} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
            <div>
              Returned to Liquidator
              <CommaNumber value={returnedToLiquidator} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
            <div>
              Profit
              <CommaNumber value={profit} decimalsToShow={2} showDecimal beginningText='$' className='upColor' />
            </div>
            <div>
              <div className="v-centering-group">
                Treasury Fee
                <Icon id='info' className='info-icon' /> 
              </div>
              <CommaNumber value={500.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
            <div>
              Collateral Withdrawn
              <CommaNumber value={50000.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
          </div>

          {Boolean(collateralData.length) && (
          <>
            <h2>Assets Received</h2>

            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>USD Value</th>
                </tr>
              </thead>

              <tbody>
                {collateralData.slice(0, -1).map(({ assetSymbol, collateralShare, balance, assetRate }, index) => (
                  <tr key={index}>
                    <td>{assetSymbol}</td>

                    <td className="grid-group">
                      <div>{collateralShare}%</div>
                      <CommaNumber value={balance} decimalsToShow={2} showDecimal />
                    </td>

                    <td>
                      <CommaNumber value={assetRate ? balance * assetRate : 0} decimalsToShow={2} showDecimal beginningText='$'/>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td>Total</td>
                  <td></td>
                  <td>
                    <CommaNumber value={collateralData[collateralData.length - 1].balance} decimalsToShow={2} showDecimal beginningText='$' className='upColor' />
                  </td>
                </tr>
              </tbody>
            </table>
          </>)}

          <div className="g-centering-group">
            <Button
              text='Liquidate'
              kind={ACTION_PRIMARY}
              onClick={() => handleLiquidateVault(vaultId, ownerId, costToLiquidate)}
            />
          </div>
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}