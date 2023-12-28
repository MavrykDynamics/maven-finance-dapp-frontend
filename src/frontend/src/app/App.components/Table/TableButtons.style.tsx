import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

export const TableActionsBtn = styled.div`
  position: absolute;
  transition: opacity 0.2s;
  cursor: pointer;

  height: fit-content;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: transparent;

  &:hover {
    opacity: 0.8;
  }
`

export const RemoveRowBtn = styled(TableActionsBtn)<{ theme: MavenTheme }>`
  top: 50%;
  transform: translateY(-50%);
  right: -25px;

  svg {
    fill: ${({ theme }) => theme.linksAndButtons};
  }
`

export const AddRowBtn = styled(TableActionsBtn)<{ theme: MavenTheme }>`
  bottom: -5px;
  left: -20px;

  svg {
    fill: ${({ theme }) => theme.linksAndButtons};
  }
`
