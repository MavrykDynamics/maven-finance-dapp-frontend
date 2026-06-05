import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { PRIMARY_TOGGLE, SECONDARY_TOGGLE } from './Toggle.consts'
import { MavenTheme } from 'styles/interfaces'

export const ToggleStyle = styled.div<{ theme: MavenTheme }>`
  display: flex;
  align-items: center;

  span {
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.base};
    line-height: 21px;
  }

  .sufix {
    margin-left: 14px;
    color: ${({ theme }) => theme.linksAndButtons};
  }

  .prefix {
    margin-right: 14px;
    color: ${({ theme }) => theme.selectedColor};
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
    background-color: ${({ theme }) => theme.backgroundColor};
    border: 1px solid ${({ theme }) => theme.strokeColor};
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
    transition: 0.3s;
  }

  input:checked ~ .slider::before {
    transform: translateX(21px);
  }

  &.checked:not(.${SECONDARY_TOGGLE}) {
    label {
      background-color: ${({ theme }) => theme.cards};
    }

    .slider::before {
      background-color: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.checked {
    .sufix {
      color: ${({ theme }) => theme.selectedColor};
    }

    .prefix {
      color: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    .toggler {
      pointer-events: none;
    }
  }

  &.${PRIMARY_TOGGLE} {
    .sufix,
    .prefix {
      color: ${({ theme }) => theme.mainHeadingText};
    }

    .slider::before {
      background-color: ${({ theme }) => theme.selectedColorSecondary};
    }
  }

  &.${SECONDARY_TOGGLE} {
    label {
      background-color: ${({ theme }) => theme.cards};
    }

    .slider::before {
      background-color: ${({ theme }) => theme.linksAndButtons};
    }
  }
`
