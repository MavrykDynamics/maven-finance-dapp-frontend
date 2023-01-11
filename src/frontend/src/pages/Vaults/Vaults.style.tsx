import styled from 'styled-components/macro'

// components
import { Card } from 'styles'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const VaultsStyled = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
`

export const VaultsSearchFilterStyled = styled(Card)`
  
`