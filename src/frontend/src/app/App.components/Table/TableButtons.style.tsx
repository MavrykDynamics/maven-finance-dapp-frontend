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

  .tooltip {
    margin: 0;
    width: 100%;
  }
`

export const RemoveRowBtn = styled(TableActionsBtn)<{ theme: MavrykTheme }>`
  top: 40%;
  transform: translateY(-50%);
  right: -25px;
  opacity: 1;

  svg {
    fill: ${({ theme }) => theme.linksAndButtons};
  }

  .text {
    bottom: 150%;
  }
`

export const AddRowBtn = styled(TableActionsBtn)<{ theme: MavrykTheme }>`
  bottom: -10px;
  left: -25px;

  span {
    font-size: 25px;
    color: ${({ theme }) => theme.linksAndButtons};
    font-weight: 500;
  }

  &:hover {
    span {
      opacity: 0.8;
    }
  }

  .text {
    bottom: 140%;
  }
`
