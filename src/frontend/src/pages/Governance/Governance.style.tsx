import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

export const GovernanceStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  margin-top: 32px;
  column-gap: 30px;

  .empty {
    position: unset;
    margin: 0 auto;
    transform: unset;
  }
`

export const GovernanceLeftContainer = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  position: relative;
  margin-top: 30px;

  &.full-width {
    width: 100%;
  }

  .cycle-dropdown {
    max-width: 260px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    margin: 0;
  }

  .proposal-history-checkbox {
    position: absolute;
    top: 50px;
    left: 0;
    z-index: 10;
  }
`

// TODO: remove this component across the dapp
export const GovRightContainerTitleArea = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`
