import React, { useState } from "react";

// components
import { CommaNumber } from "app/App.components/CommaNumber/CommaNumber.controller";
import Icon from "app/App.components/Icon/Icon.view";
import { Input } from "app/App.components/Input/NewInput";
import { InputPinnedTokenInfo } from "app/App.components/Input/Input.style";

// styles
import { LiquidateVaultModalStyled } from "./LiquidateVaultModal.styles";
import { PopupContainer, PopupContainerWrapper } from "app/App.components/SettingsPopup/SettingsPopup.style";

type Props = {
  closePopup: () => void
  show: boolean 
}

export const LiquidateVaultModal = ({ closePopup, show }: Props) => {
  const [inputAmount, setInputAmount] = useState('0')
  const [showAsPercentage, setShowAsPercentage] = useState(true)

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LiquidateVaultModalStyled>
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
              <div className="group-with-icon">
                Liquidation Max
                <Icon id='info' className='info-icon' /> 
              </div>
              <CommaNumber value={5_000.00} beginningText='$' className='numberColor'/>
            </div>

            <div>
              <div>Liquidation Reward</div>
              <CommaNumber value={10} endingText='%' className='numberColor'/>
            </div>
            
            <div>
              <div>Max Profit</div>
              <CommaNumber value={500.00} beginningText='$' className='numberColor'/>
            </div>
          </div>

          <div className="input-title">{showAsPercentage ? 'Input percent you want to liquidate' : 'Input Liquidation Amount'}</div>
          <Input
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
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>

  )
}