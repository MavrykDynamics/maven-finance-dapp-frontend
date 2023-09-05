import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { Card } from 'styles'

export const FarmsStyled = styled.div<{ theme: MavrykTheme }>`
  section {
    display: grid;
    gap: 20px;

    &.isVerticalView {
      grid-template-columns: repeat(3, 31.5%);
      align-items: baseline;
      column-gap: 30px;
    }
  }
`

export const FarmTopBarStyled = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  height: calc(40px + 17px + 17px);
  margin-bottom: 20px;
  padding: 17px 21px;

  .change-view {
    display: flex;
    align-items: center;

    height: 100%;
    column-gap: 5px;
    margin-left: 15px;

    > div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;

      button {
        width: 100%;
        height: 100%;
      }

      &.selected {
        border-radius: 8px;
        border: ${({ theme }) => `1px solid ${theme.selectedColor}`};

        svg {
          fill: ${({ theme }) => theme.selectedColor};
        }
      }
    }

    svg {
      width: 16px;
      height: 16px;
      font-size: 16px;
      fill: ${({ theme }) => theme.menuButtonText};
    }

    .btn-vertical {
      transform: rotate(90deg);
    }
  }

  .order-by {
    margin-left: 20px;

    .drop-down {
      min-width: 250px;
    }
  }

  .tab-bar {
    min-width: 220px;
    margin-right: 20px;
  }

  .farm-toggle {
    flex-shrink: 0;
    margin-right: 20px;
  }
`
