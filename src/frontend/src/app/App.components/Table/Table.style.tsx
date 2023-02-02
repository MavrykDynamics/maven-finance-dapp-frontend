import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const TableActionsBtn = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  background-color: transparent;
  height: fit-content;

  &.remove {
    .text {
      bottom: 130%;
      left: 50%;
    }
  }

  &.add {
    .text {
      bottom: 110%;
      left: 50%;
    }
  }
`

export const RemoveRowBtn = styled(TableActionsBtn)<{ theme: MavrykTheme }>`
  top: 40%;
  transform: translateY(-50%);
  right: -25px;
  width: 25px;
  height: 25px;

  &:hover {
    svg {
      opacity: 0.8;
    }
  }

  &.disabled {
    display: none;
  }

  svg {
    width: 16px;
    height: 20px;
    fill: ${({ theme }) => theme.valueColor};
  }
`

export const AddRowBtn = styled(TableActionsBtn)<{ theme: MavrykTheme }>`
  bottom: -10px;
  left: -25px;
  opacity: 1;

  span {
    font-size: 25px;
    color: ${({ theme }) => theme.valueColor};
    font-weight: 500;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover {
    span {
      opacity: 0.8;
    }
  }
`

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
  }

  &.treasury-table {
    margin-top: 30px;
  }
`

export const Table = styled.table<{ theme: MavrykTheme }>`
  width: 100%;
  position: relative;
  border-collapse: collapse;

  &.borrowing-table {
    margin-top: 5px;
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

export const TableHeader = styled.thead<{ theme: MavrykTheme }>`
  tr {
    height: fit-content;
    border: none;

    th {
      text-align: left;
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

  &.collateral {
    th {
      padding-bottom: 0;
    }

    &.empty {
      th {
        padding-bottom: 10px;
      }
    }
  }

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

export const TableBody = styled.tbody<{ theme: MavrykTheme }>`
  &.treasury {
    th,
    td {
      font-size: 14px;
      font-weight: 600;
    }

    td:first-child {
      text-transform: uppercase;
    }
  }

  &.transaction-history {
    * {
      font-size: 14px;
    }
  }
`
export const TableRow = styled.tr<{ theme: MavrykTheme; borderColor?: string; rowHeight?: number }>`
  height: ${({ rowHeight = 55 }) => `${rowHeight}px`};
  transition: border-bottom 0.4s;

  &:not(:last-child) {
    border-bottom: 0.5px solid ${({ theme, borderColor = 'cardBorderColor' }) => theme[borderColor]};
  }

  td,
  th {
    &.left {
      div {
        margin-right: auto;
      }
      text-align: left;
    }

    &.center {
      div {
        margin: 0 auto;
      }
      text-align: center;
    }

    &.right {
      div {
        margin-left: auto;
      }
      text-align: right;
    }
  }

  &.add-hover {
    &:hover {
      > td {
        color: ${({ theme }) => theme.navTitleColor};
        * {
          color: ${({ theme }) => theme.navTitleColor};

          svg {
            stroke: ${({ theme }) => theme.navTitleColor};
          }
        }
      }

      &:not(:last-child) {
        border-bottom: 0.5px solid ${({ theme }) => theme.navTitleColor};
      }
    }
  }

  &.editable-row {
    height: 42px;
    position: relative;

    td {
      color: ${({ theme }) => theme.dataColor};
      vertical-align: middle;
      text-align: center;

      div {
        margin: 0 auto;
      }
    }

    &:hover {
      > div:not(.button-wrap),
      input {
        background-color: transparent;
        border-color: transparent;
      }

      .remove {
        opacity: 1;
      }
    }
  }
`

export const TableHeaderCell = styled.th<{ theme: MavrykTheme; contentPosition?: 'left' | 'center' | 'right' }>`
  color: ${({ theme }) => theme.textColor};

  ${({ contentPosition }) => {
    switch (contentPosition) {
      case 'left':
        return css`
          text-align: left;

          div {
            margin-right: auto;
          }
        `
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
      default:
        return ''
    }
  }}
`

export const TableCell = styled.td<{
  theme: MavrykTheme
  width?: string
  contentPosition?: 'left' | 'center' | 'right'
}>`
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  color: ${({ theme }) => theme.dataColor};
  transition: color 0.4s;

  ${({ width }) =>
    width
      ? css`
          width: ${width};
        `
      : ''}

  ${({ contentPosition }) => {
    switch (contentPosition) {
      case 'left':
        return css`
          text-align: left;

          div {
            margin-right: auto;
          }
        `
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
      default:
        return ''
    }
  }}

  svg, .img-wrapper {
    width: 24px;
    height: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  button {
    max-height: 36px;
  }

  p {
    margin: 0;
  }

  .rate {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: ${({ theme }) => theme.dataColor};
  }

  .cell-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    &.row {
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      column-gap: 5px;
    }

    .no-icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;
      svg {
        fill: ${({ theme }) => theme.dataColor};
      }
    }
  }

  &.vert-middle {
    vertical-align: middle;
  }

  &.buttons {
    .cell-content {
      justify-content: flex-end;
      column-gap: 10px;
    }

    &.borrowing {
      button:not(.add-collateral) {
        width: 130px;
        padding: 0;

        svg {
          fill: ${({ theme }) => theme.valueColor};
          width: 18px;
          height: 18px;
        }
      }

      .add-collateral {
        max-width: 180px;
      }
    }
  }

  input,
  input.error,
  input.success,
  input.error:focus,
  input.success:focus,
  input:focus {
    border: unset;
    border-radius: 0;
    box-shadow: none;
  }
`
