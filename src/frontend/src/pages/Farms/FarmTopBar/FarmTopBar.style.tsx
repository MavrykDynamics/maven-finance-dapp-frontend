import { MavrykTheme } from '../../../styles/interfaces'
import styled from 'styled-components/macro'
import { Card } from 'styles'

export const FarmTopBarStyled = styled(Card)<{ theme: MavrykTheme }>`
  margin-bottom: 20px;
  display: flex;
  padding: 17px 21px;

  .change-view {
    display: flex;
    flex-shrink: 0;
    margin-left: 17px;

    svg {
      width: 16px;
      height: 16px;
      font-size: 16px;
      fill: ${({ theme }) => theme.menuButtonText};
    }

    button {
      outline: none;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid transparent;
      max-height: 36px;
      max-width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-vertical {
      transform: rotate(90deg);
    }
  }

  &.vertical .change-view .btn-vertical,
  &.horizontal .change-view .btn-horizontal {
    border: ${({ theme }) => `1px solid ${theme.selectedColor}`};

    & svg {
      fill: ${({ theme }) => theme.selectedColor};
    }
  }

  ul {
    width: 275px;
  }

  ul > li {
    font-size: 16px;
  }

  .order-by {
    margin-left: 30px;

    .drop-down {
      min-width: 250px;
    }
  }

  .tab-bar {
    min-width: 220px;
    margin-right: 15px;
  }

  .farm-toggle {
    flex-shrink: 0;
    margin-right: 15px;
  }
`
