import styled from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatellitePaginationStyled = styled(Card)<{ theme: MavrykTheme }>`
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;
  height: 74px;

  .pagination-link {
    display: flex;
    color: ${({ theme }) => theme.valueColor};
    align-items: center;
    min-height: 23px;
    stroke: ${({ theme }) => theme.valueColor};
    font-weight: 600;
    font-size: 14px;

    svg {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    &:hover {
      opacity: 0.8;
    }

    &.back {
      margin-right: auto;
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
