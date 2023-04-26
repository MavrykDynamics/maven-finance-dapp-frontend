import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

const EDITABLE_TABLE_HEADER_STYLES = css`
  &.editable-head {
    height: 42px;
    background-color: ${({ theme }) => theme.backgroundColor};

    th {
      vertical-align: middle;
      text-align: center;
      border-right: 1px solid ${({ theme }) => theme.cardBorderColor};

      &:last-child {
        border-right: none;
      }
    }
  }
`

const PROPOSAL_PAYMENTS_DETAILS_HEADER_STYLES = css`
  &.proposal-details-payments {
    th {
      font-size: 12px;
    }
  }
`

export const TableHeader = styled.thead<{ theme: MavrykTheme }>`
  z-index: 100;

  tr {
    height: fit-content;
    border: none;

    th {
      font-weight: 600;
    }
  }

  &.simple-header {
    th {
      padding-bottom: 10px;
    }
  }

  &.treasury {
    th {
      padding-bottom: 5px;
    }
  }

  &.dashboard-loans {
    th {
      padding-bottom: 7px;
    }
  }

  &.collateral {
    &.empty {
      th {
        padding-bottom: 10px;
      }
    }
  }

  ${EDITABLE_TABLE_HEADER_STYLES}
  ${PROPOSAL_PAYMENTS_DETAILS_HEADER_STYLES}
`

const LOANS_DASHBOARD_TABLE_HEADER_CELL_STYLES = css`
  &.position-multy-cell {
    .cell-content {
      padding: 0 18px;
      display: grid;
      justify-content: space-between;
    }

    &.lending {
      .cell-content {
        grid-template-columns: 1.1fr 1.3fr 0.9fr 0.4fr;
      }
    }

    &.borrowing {
      .cell-content {
        grid-template-columns: 1fr 1fr 1fr 0.4fr;
      }
    }
  }
`

export const TableHeaderCell = styled.th<{ theme: MavrykTheme; contentPosition?: 'left' | 'center' | 'right' }>`
  color: ${({ theme }) => theme.textColor};

  ${({ contentPosition }) => {
    switch (contentPosition) {
      case 'center':
        return css`
          text-align: center;

          div {
            margin-left: auto;
            margin-right: auto;
          }
        `
      case 'right':
        return css`
          text-align: right;

          div {
            margin-left: auto;
          }
        `
      case 'left':
      default:
        return css`
          text-align: left;

          div {
            margin-right: auto;
          }
        `
    }
  }}

  ${LOANS_DASHBOARD_TABLE_HEADER_CELL_STYLES}
`
