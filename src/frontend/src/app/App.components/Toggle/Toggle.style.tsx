import styled from 'styled-components/macro'
import { headerColor, darkColor, royalPurpleColor, cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const ToggleStyle = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    .toggler {
      pointer-events: none;
    }
  }

  span {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
  }

  .sufix {
    margin-left: 14px;
  }

  .prefix {
    margin-right: 14px;
  }

  .toggler {
    position: relative;
    width: 45px;
    height: 25px;
  }

  label {
    position: absolute;
    top: 0;
    width: 46px;
    height: 25px;
    background-color: ${({ theme }) => theme.containerColor};
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 50px;
    cursor: pointer;
  }

  input {
    position: absolute;
    display: none;
  }

  .slider {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50px;
    transition: 0.3s;
  }

  .slider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 3;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.valueColor};
    transition: 0.3s;
  }

  input:checked ~ .slider::before {
    transform: translateX(21px);
  }

  &.farm-toggle {
    .slider::before {
      background-color: ${({ theme }) => theme.headerColor};
    }

    .checked {
      background-color: ${({ theme }) => theme.cardBorderColor};
    }
  }

  &.personal-dashboard-toggler {
    .prefix {
      color: ${({ theme }) => theme.valueColor};
      margin-left: 10px;
    }

    .sufix {
      color: ${({ theme }) => theme.lPurple_dPurple_lPuprple};
      margin-right: 10px;
    }
  }
`
