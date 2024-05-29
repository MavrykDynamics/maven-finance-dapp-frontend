import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import styled from 'styled-components'
import { Card } from 'styles'
import { MavenTheme } from '../../styles/interfaces'

export const DataFeedsStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;

  .info-icon {
    width: 12px;
    height: 12px;

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .top-section-wrapper {
    display: flex;
    justify-content: space-between;
    height: 225px;

    h3 {
      display: flex;
      align-items: center;
      line-height: 21px;
      padding: 2px 0 3px 0;

      & > div {
        display: inherit;
      }
    }

    h4 {
      font-weight: 500;
      font-size: 14px;
      color: ${({ theme }) => theme.regularText};
      padding: 3px 0 4px 0;
      display: flex;
      align-items: center;
    }
  }

  .chart-wrapper {
    margin: 30px 0;
    min-height: 400px;
  }

  .oracles-list {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
`

export const FeedInfo = styled.div<{ theme: MavenTheme }>`
  max-width: 745px;
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;

  .top {
    padding: 30px 40px;
    display: flex;
    justify-content: space-between;
    position: relative;

    .name-part {
      padding-left: 55px;
      position: relative;
      display: flex;
      align-items: center;

      .text {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .name {
        font-weight: 700;
        font-size: 25px;
        color: ${({ theme }) => theme.mainHeadingText};
        padding: 2px 0 3px 0;
      }

      a {
        font-weight: 600;
        font-size: 12px;
        line-height: 100%;
        color: ${({ theme }) => theme.mainHeadingText};
        display: flex;
        align-items: center;

        svg {
          position: unset;
          margin-left: 3px;
          width: 12px;
          height: 12px;
          fill: ${({ theme }) => theme.mainHeadingText};
        }
      }

      .img-wrapper,
      svg {
        position: absolute;
        max-width: 45px;
        left: 0;
        font-size: 14px;
        fill: ${({ theme }) => theme.mainHeadingText};

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .price-part {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
    }

    &::before {
      position: absolute;
      content: '';
      bottom: 0;
      left: 0;
      height: 1px;
      background-color: ${({ theme }) => theme.divider};
      width: 100%;
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    column-gap: 5px;
    padding: 5px 40px 30px;
  }
`

export const ContractDetails = styled.div<{ theme: MavenTheme }>`
  max-width: 315px;
  height: 100%;
  width: 100%;
  padding: 30px 17px;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.strokeCards};
  border-radius: 10px;

  .register-pair-wrapper {
    max-width: 255px;
    width: 100%;
    margin-top: 25px;
  }

  .block-name {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
    margin-bottom: 20px;
  }

  .info-wrapper {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin: 5px 0;

    h3 {
      color: ${({ theme }) => theme.mainHeadingText};
    }
  }
`

export const DataFeedInfoBlock = styled.div<{ $justifyContent?: string; theme: MavenTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 15px;
  justify-content: ${({ $justifyContent }) => $justifyContent || 'flex-start'};
  min-height: 56px;
`

export const DataFeedValueText = styled.div<{ $fontWeidth?: number; $fontSize?: number; theme: MavenTheme }>`
  font-weight: ${({ $fontWeidth }) => $fontWeidth || 400};
  font-size: ${({ $fontSize }) => ($fontSize ? `${$fontSize}px` : '12px')};
  color: ${({ theme }) => theme.primaryText};
  display: flex;

  p {
    margin: 0;
  }

  .timer {
    * {
      line-height: 100%;
    }
  }

  &.shield {
    svg {
      margin-right: 7px;
    }
  }

  svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.primaryText};
  }
`

// User page that is not implemented yet
export const UsersListWrapper = styled.div<{ theme: MavenTheme }>`
  margin-top: 30px;

  .see-all-link {
    right: 45px !important;
  }
`

export const UsersListCardsWrapper = styled.div<{ theme: MavenTheme }>`
  display: flex;
  column-gap: 20px;
  margin-top: 30px;
  overflow: hidden;
`

export const FeedDetailsChartWrapper = styled(Card)<{ theme: MavenTheme }>`
  padding: 52px 12px 0px 20px;
  height: 420px;
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const ChartSlidingTabButtons = styled(SlidingTabButtons)`
  display: flex;
  width: 394px;
  height: 40px;

  > div {
    width: 100%;
    justify-content: flex-end;
  }

  div {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
  }

  button {
    width: 100%;
  }
`
