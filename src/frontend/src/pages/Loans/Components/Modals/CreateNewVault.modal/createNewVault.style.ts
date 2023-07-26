import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const VaultModalStepper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 21px;
  color: ${({ theme }) => theme.lightTextColor};

  div {
    display: inline-block;
  }

  span {
    color: ${({ theme }) => theme.headerColor};
  }
  span.active {
    color: #86d4c9;
    /* color: ${({ theme }) => theme.containerColor}; */
  }
`

export const VaultModalStepperWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
`

export const ModalStatsBlock = styled.div<{ theme: MavrykTheme }>`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .collateral-screen {
    .line {
      justify-content: start;
      gap: 60px;
    }
  }
`

export const DeleteCollateralInputIconWrapper = styled.div`
  display: inline-block;
  position: absolute;
  right: -10px;
  top: 50%;
  height: 12px; // same as svg icon
  transform: translate(10px, -50%);

  & > div:first-of-type {
    display: inline-block;
  }

  .text {
    bottom: 170%;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`
export const CollateralInputWrapper = styled.div`
  position: relative;
`
