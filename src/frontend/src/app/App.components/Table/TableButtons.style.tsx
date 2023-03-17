import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const TableActionsBtn = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
  background-color: transparent;
  height: fit-content;
`

export const RemoveRowBtn = styled(TableActionsBtn)<{ theme: MavrykTheme }>`
  top: 40%;
  transform: translateY(-50%);
  right: -25px;
  width: 25px;
  height: 25px;
  opacity: 0;

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

  .text {
    bottom: 130%;
    left: 50%;
  }
`

export const AddRowBtn = styled(TableActionsBtn)<{ theme: MavrykTheme }>`
  bottom: -10px;
  left: -25px;

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

  .text {
    bottom: 110%;
    left: 50%;
  }
`
