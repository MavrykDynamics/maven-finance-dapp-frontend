import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const H2Title = styled.h2<{ theme: MavrykTheme }>`
  font-weight: 600;
  font-size: 22px;
  color: ${({ theme }) => theme.mainHeadingText};

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.mainHeadingText};
    margin: 7px 0 10px 1px;
  }
`

export const H2SimpleTitle = styled(H2Title)<{ theme: MavrykTheme }>`
  &::after {
    display: none;
  }
`
