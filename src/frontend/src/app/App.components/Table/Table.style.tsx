import styled, { css } from 'styled-components'
import { DEFAULT_FOR_OVERLAP } from 'styles/constants';
import { MavrykTheme } from 'styles/interfaces'

export const TableScrollable = styled.div<{ theme: MavrykTheme; bodyHeight: number }>`
  overflow-y: auto;
  padding-right: 8px;
  overscroll-behavior: contain;
  ${({ bodyHeight }) => css`
    height: ${bodyHeight}px;
  `}

  thead {
    position: sticky;
    background-color: ${({ theme }) => theme.containerColor};
    top: 0;
    z-index: ${DEFAULT_FOR_OVERLAP};
  }

  &.treasury-table {
    margin-top: 30px;
  }

  &.dashboard-loans-table {
    padding-right: 30px;
  }
`

export const Table = styled.table<{ theme: MavrykTheme }>`
  width: 100%;

  border-collapse: collapse;

  &.borrowing-table {
    margin-top: 5px;
    position: relative;
    margin-bottom: 10px;

    &.show-before {
      &::before {
        content: '';
        position: absolute;
        bottom: 0px;
        height: 1px;
        width: 100%;
        background-color: ${({ theme }) => theme.cardBorderColor};
      }
    }
  }

  &.treasury-table {
    margin-top: 30px;
  }

  &.editable-table {
    margin-top: 15px;
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    position: relative;
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;
    border-radius: 10px;

    &.with-header {
      thead {
        th:first-child {
          border-top: unset;
          border-left: unset;
          border-top-left-radius: 10px;
        }

        th:last-child {
          border-top: unset;
          border-right: unset;
          border-top-right-radius: 10px;
        }
      }

      tr {
        td {
          border: unset;
          border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
          border-right: 1px solid ${({ theme }) => theme.cardBorderColor};
        }

        td:last-of-type {
          border: unset;
          border-right: unset;
          border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
        }
      }
    }

    &.one-column {
      td {
        border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
      }

      tr:first-child {
        td {
          border-right: unset;
          border-top: unset;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }
      }
    }

    tr:last-child {
      td:first-child {
        border-bottom: unset;
        border-left: unset;
        border-bottom-left-radius: 10px;
      }

      td:last-child {
        border-bottom: unset;
        border-right: unset;
        border-bottom-right-radius: 10px;
      }
    }

    td {
      input {
        background: transparent;
      }
    }
  }

  &.transaction-history-table {
    margin-top: 30px;
  }
`

export const TableBody = styled.tbody<{ theme: MavrykTheme }>`
  &.treasury {
    th,
    td {
      font-size: 14px;
      font-weight: 600;
    }
  }

  &.dashboard-loans {
    svg {
      width: 60px;
      height: 60px;
    }
  }

  &.transaction-history {
    * {
      font-size: 14px;
    }

    .descr {
      font-size: 16px;
    }
  }
`
