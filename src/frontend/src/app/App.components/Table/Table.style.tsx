import styled from 'styled-components'
import { cyanColor, headerColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const TableStyled = styled.div<{ theme: MavrykTheme; columns: number }>`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  position: relative;

  .row {
    display: flex;
    width: 100%;
    justify-content: space-between;
    position: relative;

    &.column-names {
      height: 42px;
      > div {
        color: ${({ theme }) => theme.textColor};
        height: 100%;
      }
    }

    > div:not(.button-wrap) {
      font-weight: 600;
      width: ${({ columns }) => 100 / columns}%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid ${({ theme }) => theme.cardBorderColor};
      background-color: ${({ theme }) => theme.backgroundColor};

      &.roundTopLeft {
        border-top-left-radius: 10px;
      }
      &.roundTopRight {
        border-top-right-radius: 10px;
      }
      &.roundBottomLeft {
        border-bottom-left-radius: 10px;
      }
      &.roundBottomRight {
        border-bottom-right-radius: 10px;
      }

      input {
        border: unset;
      }

      p {
        margin: 0;
      }
    }

    &:not(.column-names) {
      > div {
        color: ${({ theme }) => theme.dataColor};
      }

      > div:last-child {
        padding-right: 5px;
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

  div {
    background-color: transparent;
  }

  &.remove {
    .text {
      bottom: 130%;
      left: 80%;
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

  button {
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
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

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    color: ${({ theme }) => theme.valueColor};

    &:hover {
      opacity: 0.8;
    }
  }
`
