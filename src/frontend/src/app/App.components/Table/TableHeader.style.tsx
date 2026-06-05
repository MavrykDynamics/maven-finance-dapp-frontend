import styled, { css } from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { DEFAULT_Z_INDEX_FOR_OVERLAP } from 'styles/constants'
import { MavenTheme } from 'styles/interfaces'

const EDITABLE_TABLE_HEADER_STYLES = css`
  &.editable-head {
    height: 42px;
    background-color: ${({ theme }) => theme.backgroundColor};

    th {
      vertical-align: middle;
      text-align: center;
      font-size: ${FontSize.md};
      border-right: 1px solid ${({ theme }) => theme.strokeColor};

      &:last-child {
        border-right: none;
      }
    }
  }
`

const PROPOSAL_PAYMENTS_DETAILS_HEADER_STYLES = css`
  &.proposal-details-payments {
    th {
      font-size: ${FontSize.sm};
    }
  }
`

export const TableHeader = styled.thead<{ theme: MavenTheme }>`
  z-index: ${DEFAULT_Z_INDEX_FOR_OVERLAP};

  tr {
    height: fit-content;
    border: none;

    th {
      font-weight: ${FontWeight.semibold};
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

export const TableHeaderCell = styled.th<{ theme: MavenTheme; contentPosition?: 'left' | 'center' | 'right' }>`
  color: ${({ theme }) => theme.subHeadingText};

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
