import styled from 'styled-components/macro'
import { Card } from 'styles'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const BreakGlassCouncilStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;

  .left-block {
    width: 750px;

    & > h1 {
      margin-bottom: 11px;
    }

    .pending {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }

    .pending-items {
      width: 750px;
    }
  }

  .right-block {
    width: 310px;

    & > h1 {
      margin-top: 30px;
      margin-bottom: 10px;
    }
  }
`

export const PropagateBreakGlassCouncilCard = styled(Card)<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 30px;
  height: 75px;

  h1 {
    margin: 0;

    &::after {
      display: none;
    }
  }

  button {
    white-space: nowrap;
  }
`

export const ReviewPastCouncilActionsCard = styled(Card)<{
  displayPendingSignature: boolean
  theme: MavrykTheme
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
  margin-top: ${({ displayPendingSignature }) => (displayPendingSignature ? 0 : 30)}px;
  margin-bottom: 23px;
  height: 201px;

  button {
    white-space: nowrap;
  }

  button:first-of-type {
    margin-bottom: 20px;
  }
`

export const GoBack = styled(Card)`
  display: flex;
  align-items: center;
  padding: 0 26px;
  height: 75px;

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: ${({ theme }) => theme.headerColor};
  cursor: pointer;

  svg {
    margin-right: 8px;
  }
`

export const AvaliableActions = styled(Card)<{ theme: MavrykTheme }>`
  padding: 0;

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 0 30px;
    height: 75px;
  }

  .top-bar-title {
    margin: 0;

    font-weight: 600;
    font-size: 22px;
    line-height: 22px;

    &::after {
      display: none;
    }
  }

  .dropdown-size {
    width: 440px;
  }
`

