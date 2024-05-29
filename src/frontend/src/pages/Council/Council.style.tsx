import styled from 'styled-components'
import { Card } from 'styles'

// types
import { MavenTheme } from '../../styles/interfaces'

export const CouncilPageWrapper = styled.div`
  margin-top: 30px;

  .pending-signature-title {
    margin-bottom: 20px;
  }
`

export const CouncilStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: space-between;

  .left-block,
  .right-block {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

  .left-block {
    > a {
      display: block;
      width: fit-content;
    }

    width: 750px;

    .actions-list {
      display: flex;
      flex-direction: column;

      width: 100%;
      row-gap: 10px;
    }
  }

  .right-block {
    width: 310px;
  }
`

export const PropagateBreakGlassCouncilCard = styled(Card)<{ theme: MavenTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px;
  margin: 0;

  p {
    margin: 10px 0 0 0;
    max-width: 630px;

    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    color: ${({ theme }) => theme.regularText};
  }

  button {
    white-space: nowrap;
  }
`

export const CouncilSidebarNav = styled(Card)<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;

  width: 100%;

  row-gap: 20px;
  padding: 40px 30px;
  margin: 0;
  margin-bottom: 10px;
`

export const AvailableActions = styled(Card)<{ theme: MavenTheme }>`
  margin: 0;
  margin-bottom: 10px;
  padding: 0;

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px 0 30px;
    height: 75px;
  }

  .dropdown {
    width: 440px;
    text-transform: capitalize;
  }
`
