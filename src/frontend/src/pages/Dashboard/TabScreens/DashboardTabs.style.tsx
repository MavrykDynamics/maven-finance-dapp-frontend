import styled from 'styled-components'
import {CardHover, Card, FontSize, FontWeight} from 'styles'
import { MavenTheme } from 'styles/interfaces'
import { EmptyContainer as EmptyContainerBase } from 'app/App.style'

export const TabWrapperStyled = styled.div<{ theme: MavenTheme; $backgroundImage?: string }>`
  padding: 24px 32px 40px 32px;
  position: relative;

  background: ${({ $backgroundImage, theme }) =>
    $backgroundImage ? `url(/images/dashboard/${$backgroundImage}), ${theme.cards}` : theme.cards};
  background-size: auto;
  background-repeat: no-repeat;
  background-position: right bottom;
  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;
  height: 579px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .tabLoader {
    margin-top: 50px;
  }

  .top {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .dashboard-sectionLink {
      display: block;
      width: 220px;
    }

    h1 {
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.xl};
      line-height: 22px;
    }
  }

  .descr {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    max-width: 600px;

    .title {
      font-weight: ${FontWeight.bold};
      font-size: ${FontSize.lg};
      line-height: 27px;
      color: ${({ theme }) => theme.mainHeadingText};
    }

    .text {
      font-weight: ${FontWeight.medium};
      font-size: ${FontSize.md};
      line-height: 24px;

      color: ${({ theme }) => theme.regularText};

      a {
        color: ${({ theme }) => theme.linksAndButtons};
      }
    }
  }

  &.oracles {
    .descr {
      max-width: 800px;
    }
  }

  &.vaults {
    .descr {
      max-width: 100%;
    }
  }
`

export const LendingContentStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  column-gap: 48px;
  margin-bottom: 40px;
  position: relative;

  .spacer {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -25px;
    height: 280px;
    width: 1px;
    background-color: ${({ theme }) => theme.divider};
  }

  .impact-wrapper {
    position: absolute;
    top: 100%;
    right: -30px;
    text-wrap: nowrap;
  }

  .left,
  .right {
    padding-top: 10px;
    width: 45%;
  }

  .left,
  .right {
    .stats-row {
      margin-top: 54px;
      display: flex;
      justify-content: space-between;

      > div {
        row-gap: 0;
      }
    }
  }
`
export const StakingContentStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  max-width: 600px;
  column-gap: 48px;
  margin-bottom: 40px;
  position: relative;

  .chart-wrapper {
    margin-top: 30px;
    padding-left: 20px;
    position: relative;
  }

  .chart-title {
    position: absolute;
    left: 40px;
    top: 20px;

    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.lg};
    line-height: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  .name {
    a {
      display: flex;
      margin-left: 5px;
    }
  }

  .value {
    height: 25px;
  }

  .flexbox {
    display: flex;
    align-items: center;
  }

  .left {
    width: 100%;
    padding: 0 20px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    column-gap: 32px;
  }

  .left {
    .stats-row {
      margin-top: 54px;
      display: flex;
      justify-content: space-between;
    }
  }
`
export const StakingHistoryChartWrapper = styled(Card)<{ theme: MavenTheme }>`
  padding: 38px 0 15px 20px;
  height: 148px;
  margin: 0;

  display: flex;
  flex-direction: column;
`

export const SatellitesContentStyled = styled.div<{ theme: MavenTheme }>`
  display: grid;
  padding-left: 20px;
  grid-template-columns: repeat(3, auto);
  flex-direction: column;
  margin-top: 20px;
  row-gap: 20px;
  column-gap: 10px;
  justify-content: space-between;
  max-width: 600px;
`

export const OraclesContentStyled = styled.div<{ theme: MavenTheme }>`
  margin-top: 20px;

  .wrapper {
    display: flex;
    flex-direction: column;
  }

  .top {
    width: fit-content;
    column-gap: 50px;

    .value {
      height: 25px;
    }
  }

  .block-name {
    margin-top: 30px;
    font-weight: ${FontWeight.semibold};
    font-size: ${FontSize.lg};
    line-height: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  .feeds-grid {
    margin-top: 15px;
    margin-bottom: 5px;
    row-gap: 7px; /*for shadows on hover */
    max-width: 680px;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    .row {
      display: grid;
      grid-template-columns: 1.25fr 0.8fr 0.9fr auto;
      padding-right: 10px;

      .value {
        height: max-content;
        transition: color 0.4s ease-in-out;
      }
    }
  }

  .padding-left {
    padding-left: 20px;
  }
`

export const TreasuryContentStyled = styled.div<{ theme: MavenTheme }>`
  padding-left: 20px;
  margin-top: 20px;

  .top {
    width: fit-content;
    column-gap: 50px;

    .name {
      text-transform: capitalize;
    }

    .value {
      height: 25px;
    }
  }

  .container {
    display: flex;
    margin-top: 32px;
    column-gap: 55px;

    > div {
      width: 50%;
    }
  }
`

export const TreasuryVesting = styled.div<{
  theme: MavenTheme
  $totalPersent: number
  $claimedColor: string
  $totalColor: string
}>`
  padding: 30px 20px 33px 20px;
  border: 0.5px solid ${({ theme }) => theme.strokeColor};
  border-radius: 10px;
  margin-top: 20px;

  .vest-stat {
    display: flex;
    justify-content: space-between;
    margin: 7px 0;

    .name {
      color: ${({ theme }) => theme.subHeadingText};
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.base};
      line-height: 21px;
      display: flex;
      column-gap: 10px;

      .color {
        width: 16px;
        height: 16px;
        border-radius: 50%;

        &.claimed {
          background-color: ${({ theme, $claimedColor }) => theme[$claimedColor]};
        }

        &.total {
          background-color: ${({ theme, $totalColor }) => theme[$totalColor]};
        }
      }
    }

    .value {
      color: ${({ theme }) => theme.primaryText};
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.base};
      line-height: 21px;

      p {
        margin: 0;
      }
    }
  }

  .ratio {
    margin-top: 30px;
    display: flex;

    > div {
      position: relative;
      cursor: pointer;
      height: 4px;

      &:hover {
        .hoverValue {
          visibility: visible;
          opacity: 1;
        }
      }
    }

    .hoverValue {
      font-size: ${FontSize.sm};
      position: absolute;
      bottom: 13px;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      white-space: pre-line;
      padding: 4px 6px;
      border-radius: 3px;
      line-height: 15px;
      background: ${({ theme }) => theme.messagesBackground};
      color: ${({ theme }) => theme.regularText};
      opacity: 0;
      transition: 0.3s all;
      visibility: hidden;
      width: max-content;
      max-width: 330px;

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -8px;
        border-width: 8px;
        border-style: solid;
        border-color: ${({ theme }) => theme.strokeCards};
      }

      &:hover {
        visibility: visible;
        opacity: 1;
      }
    }

    .claimed {
      background-color: ${({ theme, $claimedColor }) => theme[$claimedColor]};
      width: ${({ $totalPersent }) => `${100 - $totalPersent}%`};
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    .total {
      width: ${({ $totalPersent }) => `${$totalPersent}%`};
      background-color: ${({ theme, $totalColor }) => theme[$totalColor]};
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
`

export const VaultsContentStyled = styled.div<{ theme: MavenTheme }>`
  padding-left: 20px;
  margin-top: 20px;

  .top {
    width: 50%;
    justify-content: space-between;

    .value {
      height: 25px;
    }
  }

  .container {
    display: flex;
    margin-top: 32px;
    column-gap: 55px;

    > div {
      width: 50%;

      &.chart-wrapper {
        width: 360px;
        position: absolute;
        right: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        top: 55%;
        transform: translateY(-63%);
      }

      .asset-lables {
        display: flex;
        max-height: 75px;
        overflow: auto;
        gap: 6px;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 15px;
      }

      .asset-lable {
        padding-top: 2px;
        padding-bottom: 2px;
        border-bottom-left-radius: 6px;
        border-top-left-radius: 6px;
        max-width: 110px;
        width: 100%;
      }

      .asset-lable-text {
        font-weight: ${FontWeight.semibold};
        font-size: ${FontSize.base};
        line-height: 16px;
        color: ${({ theme }) => theme.regularText};
        margin: 0;
        margin-left: 8px;
        line-height: 30px;
        padding-left: 10px;
        background-color: ${({ theme }) => theme.cards};
      }
    }

    .summary {
      display: flex;
      column-gap: 20px;
      margin-left: auto;
      justify-content: flex-end;
      margin-top: 13px;

      .name {
        font-weight: ${FontWeight.semibold};
        font-size: ${FontSize.md};
        line-height: 22px;
      }

      .value {
        font-weight: ${FontWeight.semibold};
        font-size: ${FontSize.xl};
        line-height: 22px;
        color: ${({ theme }) => theme.primaryText};
        p {
          margin: 0;
        }
      }
    }
  }
`

export const FarmsContentStyled = styled.div<{ theme: MavenTheme }>`
  padding-left: 25px;

  .tabLoader {
    margin-top: 0;
  }

  .farms-stats {
    margin: 20px 0 40px 0;
    display: flex;
    column-gap: 60px;

    .collumn {
      display: flex;
      flex-direction: column;
      row-gap: 7px;

      .name {
        color: ${({ theme }) => theme.subHeadingText};
        font-weight: ${FontWeight.semibold};
        font-size: ${FontSize.base};
        line-height: 21px;
      }

      .value {
        height: 27px;
        display: flex;
        align-items: center;
        column-gap: 5px;
        color: ${({ theme }) => theme.primaryText};
        font-weight: ${FontWeight.semibold};
        font-size: ${FontSize.xl};
      }
    }
  }

  .farms-list {
    display: flex;
    column-gap: 80px;

    overflow-x: auto;
    padding-bottom: 7px;

    a {
      cursor: pointer;
      width: fit-contentb;
      position: relative;

      &::before {
        position: absolute;
        top: 0;
        right: -40px;
        width: 1px;
        height: 100%;
        content: '';
        background-color: ${({ theme }) => theme.divider};
        pointer-events: none;
      }

      &:last-child {
        &::before {
          display: none;
        }
      }

      &:hover {
        opacity: 1;
      }
    }

    .card {
      opacity: 1;
      width: 250px;
      transition: 0.3s all;

      &:hover {
        opacity: 0.7;
      }

      p {
        margin: 0;
      }

      .top {
        align-items: center;
        margin-bottom: 30px;

        .name {
          display: flex;
          flex-direction: column;

          height: fit-content;
          width: calc(100% - 80px);
          row-gap: 5px;
          color: ${({ theme }) => theme.mainHeadingText};

          .large {
            font-weight: ${FontWeight.semibold};
            font-size: ${FontSize.lg};
            width: 100%;

            overflow-y: clip;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .creator {
            font-weight: ${FontWeight.medium};
            font-size: ${FontSize.sm};

            // TODO: remove when address will be in indexer
            visibility: hidden;
          }
        }

        > svg {
          width: 58px;
          height: 58px;
        }
      }

      .row-info {
        display: flex;
        justify-content: space-between;
        margin: 3px 0;

        .name {
          color: ${({ theme }) => theme.subHeadingText};
          font-weight: ${FontWeight.semibold};
          font-size: ${FontSize.base};
          line-height: 21px;
        }

        .value {
          color: ${({ theme }) => theme.primaryText};
          font-weight: ${FontWeight.semibold};
          font-size: ${FontSize.base};
          line-height: 21px;
        }
      }
    }
  }
`

export const PopularFeed = styled(CardHover)`
  margin-top: 0;
  padding: 10px 20px 10px 19px;
  border: 1px solid transparent;

  .name {
    display: flex;
    align-items: center;
  }

  .value {
    font-size: ${FontSize.md};
  }
`

export const EmptyContainer = styled(EmptyContainerBase)`
  margin: auto;
  padding: 0;
`
