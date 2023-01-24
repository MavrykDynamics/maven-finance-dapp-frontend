import React from "react";

// components
import { CommaNumber } from "app/App.components/CommaNumber/CommaNumber.controller";
import Icon from "app/App.components/Icon/Icon.view";

// styles
import { LiquidateVaultModalStyled } from "./LiquidateVaultModal.styles";
import { PopupContainer, PopupContainerWrapper } from "app/App.components/SettingsPopup/SettingsPopup.style";

type Props = {
  closePopup: () => void
  show: boolean 
}

export const LiquidateVaultModal = ({ closePopup, show }: Props) => {
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
              <div>
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
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>

  )
}