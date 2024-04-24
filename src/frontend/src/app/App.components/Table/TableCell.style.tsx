import styled, { css } from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

const TABLE_CELL_DEFAULT_TAGS_STYLES = css`
  svg,
  .img-wrapper {
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

  a {
    width: fit-content;
  }

  input,
  input.error,
  input.success,
  input.error:focus,
  input.success:focus,
  input:focus,
  #inputStyled {
    border: unset;
    border-radius: 0px;
    box-shadow: none;
  }
`

const LOANS_DASHBOARD_CELL_STYLES = css`
  &.position-multy-cell {
    .cell-content {
      background: ${({ theme }) => theme.backgroundColor};
      border-radius: 10px;
      padding: 8px 20px;
      display: grid;
      justify-content: space-between;

      a {
        display: flex;
        margin-left: auto;
        align-items: center;
      }
    }

    &.lending:not(.one-item) {
      .cell-content {
        grid-template-columns: 1.1fr 1.3fr 0.9fr 0.4fr;
      }
    }

    &.borrowing:not(.one-item) {
      .cell-content {
        grid-template-columns: 1.1fr 1.1fr 1.1fr 0.4fr;

        .vault-status {
          &.low {
            color: ${({ theme }) => theme.upColor};
          }

          &.risk {
            color: ${({ theme }) => theme.warningColor};
          }

          &.hight {
            color: ${({ theme }) => theme.downColor};
          }
        }
      }
    }

    &.one-item {
      .cell-content {
        padding: 10px 20px;
        justify-content: center;
      }
    }
  }
`

const CELL_BUTTONS_STYLES = css`
  &.buttons {
    .cell-content {
      justify-content: flex-end;
      column-gap: 10px;
    }

    &.borrowing {
      > div {
        display: grid;
        grid-template-columns: 120px 120px;
        justify-content: flex-end;
      }

      &.single-btn {
        > div {
          grid-template-columns: 130px;
        }
      }

      &.total {
        > div {
          grid-template-columns: 270px;
        }
      }
    }
  }
`

const COMPONENTS_ALIGNMENT_STYLES = css`
  &.tz-address-cell-center {
    div {
      justify-content: center;
    }
  }
`

const CELL_CONTENT_STYLES = css`
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

    &.asset-name {
      font-size: 16px;
      column-gap: 7px;
    }

    &.with-icon {
      svg {
        fill: ${({ theme }) => theme.regularText};
      }
    }

    .no-icon {
      width: 24px;
      height: 24px;
      margin-right: 5px;
      svg {
        fill: ${({ theme }) => theme.primaryText};
      }
    }

    .rate {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: ${({ theme }) => theme.primaryText};
    }
  }
`

type TableCellStyledProps = {
  theme: MavenTheme
  $width?: string
  $contentPosition?: 'left' | 'center' | 'right'
}
export const TableCell = styled.td<TableCellStyledProps>`
  color: ${({ theme }) => theme.primaryText};
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  transition: color 0.4s;

  ${({ $width }) =>
    $width
      ? css`
          width: ${$width};
        `
      : ''}

  ${({ $contentPosition }) => {
    switch ($contentPosition) {
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

  &.vert-middle {
    vertical-align: middle;
  }

  &.hide-overflow {
    overflow: hidden;
  }

  ${TABLE_CELL_DEFAULT_TAGS_STYLES}

  ${LOANS_DASHBOARD_CELL_STYLES}

  ${CELL_BUTTONS_STYLES}

  ${CELL_CONTENT_STYLES}

  ${COMPONENTS_ALIGNMENT_STYLES}
`
