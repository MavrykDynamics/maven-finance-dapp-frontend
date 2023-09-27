import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const SatellitePaginationStyled = styled.div<{ theme: MavrykTheme }>`
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;
  height: 74px;

  .go-back {
    margin-right: auto;
  }

  .pagination-link {
    display: flex;
    color: ${({ theme }) => theme.linksAndButtons};
    align-items: center;
    min-height: 23px;
    font-weight: 600;
    font-size: 14px;

    svg {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      stroke: ${({ theme }) => theme.linksAndButtons};
    }

    &:hover {
      opacity: 0.8;
    }

    &.prev {
      margin-left: auto;
    }

    &.next {
      margin-left: 35px;

      svg {
        transform: rotate(180deg);
        margin-left: 8px;
        margin-right: auto;
      }
    }
  }
` //SatellitePaginationStyled
