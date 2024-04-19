import styled, { css } from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'

export const TrimStyled = styled.div<{ trim?: boolean; theme: MavenTheme }>`
  ${({ trim }) =>
    trim &&
    css`
      &::after {
        content: '...';
      }
    `}
`
