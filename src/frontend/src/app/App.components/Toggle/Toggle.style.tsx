import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const ToggleStyle = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  span {
    font-weight: 600;
    font-size: 14px;
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
    background-color: ${({ theme }) => theme.strokeColor};
    transition: 0.3s;
  }

  input:checked ~ .slider::before {
    transform: translateX(21px);
  }

  &.checked:not(.labels) {
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

  &.labels {
    label {
      background-color: ${({ theme }) => theme.cards};
    }

    .slider::before {
      background-color: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    .toggler {
      pointer-events: none;
    }
  }
`
