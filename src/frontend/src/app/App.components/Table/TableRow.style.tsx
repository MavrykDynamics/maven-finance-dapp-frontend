import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

const HOVERABLE_TABLE_ROW_STYLES = css`
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
`

const EDITABLE_TABLE_ROW_STYLES = css`
  &.editable-row {
    height: 42px;
    position: relative;

    td {
      color: ${({ theme }) => theme.dataColor};
      vertical-align: middle;
      text-align: center;

      > div {
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

export const TableRow = styled.tr<{ theme: MavrykTheme; borderColor?: string; rowHeight?: number }>`
  height: ${({ rowHeight = 55 }) => `${rowHeight}px`};
  transition: border-bottom 0.4s;

  &:not(:last-child) {
    border-bottom: 0.5px solid ${({ theme, borderColor = 'cardBorderColor' }) => theme[borderColor]};
  }

  ${HOVERABLE_TABLE_ROW_STYLES}

  ${EDITABLE_TABLE_ROW_STYLES}
`
