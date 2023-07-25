import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const VaultModalStepper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 21px;
  color: ${({ theme }) => theme.lightTextColor};

  div {
    display: inline-block;
  }

  span {
    color: ${({ theme }) => theme.headerColor};
  }
  span.active {
    color: #86d4c9;
    /* color: ${({ theme }) => theme.containerColor}; */
  }
`

export const VaultModalStepperWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
`
