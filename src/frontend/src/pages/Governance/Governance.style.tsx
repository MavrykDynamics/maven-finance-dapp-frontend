import styled from 'styled-components/macro'
import { MavenTheme } from '../../styles/interfaces'
import { DEFAULT_Z_INDEX_FOR_OVERLAP } from 'styles/constants'

export const GovernanceStyled = styled.div<{ theme: MavenTheme }>`
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

export const GovernanceLeftContainer = styled.div<{ theme: MavenTheme }>`
  width: 50%;
  position: relative;

  &.full-width {
    width: 100%;
  }

  .cycle-dropdown {
    max-width: 260px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: ${DEFAULT_Z_INDEX_FOR_OVERLAP};
    margin: 0;
  }

  .proposal-history-checkbox-wrapper {
    position: absolute;
    top: 50px;
    left: 0;
    z-index: ${DEFAULT_Z_INDEX_FOR_OVERLAP};
  }
`

// TODO: remove this component across the dapp
export const GovRightContainerTitleArea = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`
