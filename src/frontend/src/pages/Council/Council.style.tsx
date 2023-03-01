import styled from 'styled-components/macro'
import { Card, CardHover } from 'styles'
import { TabSwitcher as TabSwitcherBase } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const CounsilPageWrapper = styled.div`
  .go-back {
    margin-top: 30px;
  }
`

export const CouncilStyled = styled.div<{ theme: MavrykTheme }>`
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

export const ReviewCard = styled(Card)<{
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
    width: 100%;
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

export const CouncilActionStyled = styled(CardHover)<{ theme: MavrykTheme }>`
  width: 751px;
  padding: 0;
  margin-top: 0;
  margin-bottom: 10px;

  .top {
    padding: 15px 30px;
    height: 75px;
  }

  .bottom {
    padding: 20px 30px;
    border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
  }

  .row {
    display: grid;
    grid-template-columns: 145px 205px 250px;
    grid-column-gap: 45px;

    &:nth-child(2) {
      margin-top: 20px;
    }
  }

  .top-row {
    grid-template-columns: 145px 245px 145px 20px;
  }

  .two-columns {
    grid-template-columns: auto 250px;
  }

  .column {
    .column-name {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;

      text-transform: capitalize;
      color: ${({ theme }) => theme.textColor};
    }

    .column-value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.dataColor};
      text-transform: capitalize;
      text-overflow: ellipsis;
      max-width: inherit;
      overflow: hidden;
    }

    .column-image {
      height: 50px;
      width: 50px;
      object-fit: cover;
      border-radius: 50%;
    }

    .column-link {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;

      color: ${({ theme }) => theme.topBarLinkColor};
      text-decoration: underline;
      text-overflow: ellipsis;
      max-width: inherit;
      overflow: hidden;

      cursor: pointer;
    }

    .column-address {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.dataColor};

      svg {
        stroke: ${({ theme }) => theme.dataColor};
        width: 20px;
      }
    }

    .is-green {
      color: ${({ theme }) => theme.upColor};
    }

    .is-red {
      color: ${({ theme }) => theme.downColor};
    }
  }

  figure {
    margin: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    svg {
      width: 16px;
      height: 16px;
    }

    .icon-send {
      svg {
        fill: ${({ theme }) => theme.topBarLinkColor};
      }

      &:hover {
        svg {
          opacity: 0.8;
        }
      }
    }
  }
`

export const TabSwitcher = styled(TabSwitcherBase)`
  margin: 30px 0;
  width: 300px;
`
