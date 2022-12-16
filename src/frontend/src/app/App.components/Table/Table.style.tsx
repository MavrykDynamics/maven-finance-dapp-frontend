import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const TableStyled = styled.table<{ theme: MavrykTheme; columns: number }>`
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 6px;
  position: relative;
  border-spacing: 0;

  tr {
    height: 42px;
    position: relative;

    &:not(.column-names) {
      td {
        color: ${({ theme }) => theme.dataColor};
      }

      &:hover {
        background-color: ${({ theme }) => theme.containerColor};

        > div:not(.button-wrap),
        input {
          background-color: ${({ theme }) => theme.containerColor};
        }

        .remove {
          opacity: 1;
        }
      }
    }
  }

  th {
    color: ${({ theme }) => theme.textColor};
    height: 100%;
  }

  th,
  td {
    width: ${({ columns }) => 100 / columns}%;

    &.right-border {
      border-right: 1px solid ${({ theme }) => theme.cardBorderColor};
    }

    &.top-border {
      border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
    }

    &.no-right-border {
      border-right: unset;
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
  }

  &.stage-3-table {
    margin-top: 20px;
  }
`

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

  &:hover {
    span {
      opacity: 0.8;
    }
  }
`
