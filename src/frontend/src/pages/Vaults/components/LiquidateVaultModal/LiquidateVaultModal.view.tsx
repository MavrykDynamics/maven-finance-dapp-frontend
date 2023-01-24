import React from "react";

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
          Hello moto
        </LiquidateVaultModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>

  )
}