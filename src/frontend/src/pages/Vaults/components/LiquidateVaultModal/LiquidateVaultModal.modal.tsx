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

//===================================
// TODO: hardcode data
const mock = [
  {
    asset: 'USDt',
    amount: {
      perc: 12,
      sum: 21323434,
    },
    usd: 235676784
  },
  {
    asset: 'XTZ',
    amount: {
      perc: 139,
      sum: 4543,
    },
    usd: 235676784
  },
  {
    asset: 'tzBTC',
    amount: {
      perc: 82,
      sum: 42523454534,
    },
    usd: 235676784
  },
]

const profit = 1234.44
const total = 23164243.34
const vaultId = 1
const vaultOwner = 'tzAddress'
const liquidateAmount = 1
//===================================

type Props = {
  handleLiquidateVault: (vaultId: number, vaultOwner: string, liquidateAmount: number) => void
  closePopup: () => void
  show: boolean 
}

export const LiquidateVaultModal = ({ handleLiquidateVault, closePopup, show }: Props) => {
  const [inputAmount, setInputAmount] = useState('0')
  const [showAsPercentage, setShowAsPercentage] = useState(true)

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
              <CommaNumber value={5_000.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>

            <div>
              <div>Liquidation Reward</div>
              <CommaNumber value={10} endingText='%' className='numberColor'/>
            </div>
            
            <div>
              <div>Max Profit</div>
              <CommaNumber value={500.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
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
              balance: 1,
              balanceAsset: showAsPercentage ? '%' : 'USDt',
              useMaxHandler: () => setInputAmount('1000'),
              inputStatus: '',
              convertedValue: 1,
            }}
          >
            <InputPinnedTokenInfo>
              {showAsPercentage
                ? '%' 
                : <>
                    <Icon id="usedt-tether" /> USDt
                  </>}
            </InputPinnedTokenInfo>
          </Input>

          <Toggle
            className="toggle"
            prefix={'USDt'}
            sufix={'Percent'}
            checked={showAsPercentage}
            onChange={() => setShowAsPercentage(!showAsPercentage)}
          />

          <hr />

          <h1 className="without-underscore">Your Liquidation Summary</h1>

          <div className="grid-group">
            <div>
              Cost to Liquidate
              <CommaNumber value={50000.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor '/>
            </div>
            <div>
              Liquidation Reward
              <CommaNumber value={500.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
            <div>
              Returned to Liquidator
              <CommaNumber value={3000.00} decimalsToShow={2} showDecimal beginningText='$' className='numberColor'/>
            </div>
            <div>
              Profit
              <CommaNumber value={profit} decimalsToShow={2} showDecimal beginningText='$' className={profit > 0 ? 'upColor' : 'downColor'}/>
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
              {mock.map((item, index) => (
                <tr key={index}>
                  <td>{item.asset}</td>

                  <td className="grid-group">
                    <div>{item.amount.perc}%</div>
                    <div>{item.amount.sum}</div>
                  </td>

                  <td>
                    <CommaNumber value={item.usd} decimalsToShow={2} showDecimal beginningText='$'/>
                  </td>
                </tr>
              ))}

              <tr>
                <td>Total</td>
                <td></td>
                <td>
                  <CommaNumber value={total} decimalsToShow={2} showDecimal beginningText='$' className={total > 0 ? 'upColor' : 'downColor'}/>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="g-centering-group">
            <Button
              text='Liquidate'
              kind={ACTION_PRIMARY}
              onClick={() => handleLiquidateVault(vaultId, vaultOwner, liquidateAmount)}
            />
          </div>
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}