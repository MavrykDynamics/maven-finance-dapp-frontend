import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { H2SimpleTitle } from 'styles/generalStyledComponents/Titles.style'

export const DashboardStyled = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: -20px;
  > .top {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    height: 235px;
    column-gap: 20px;

    > div {
      width: 50%;
      height: 100%;
      border: 1px solid ${({ theme }) => theme.strokeCards};
      padding: 25px 0 0 30px;
      border-radius: 10px;
    }

    .tvlBlock {
      background-image: url('/images/dashboard/dashboardTVLbg.svg'), ${({ theme }) => theme.dashboardTvlBackground};
      background-size: cover;
      background-repeat: no-repeat;

      > div {
        font-weight: 600;
        font-size: 32px;
        color: ${({ theme }) => theme.primaryText};
        margin-top: 30px;
      }
    }

    .mvkStats {
      background-color: ${({ theme }) => theme.cards};

      .statsWrapper {
        margin-top: 15px;
        display: grid;
        grid-template-columns: repeat(3, auto);
        column-gap: 30px;
        row-gap: 20px;
      }
    }
  }

  .dashboard-navigation {
    display: flex;
    margin: 30px 0 20px 0;
    column-gap: 15px;

    > a {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      position: relative;
      transition: 0.3s all;
      color: ${({ theme }) => theme.menuButtonText};

      &.selected,
      &:hover {
        &:before {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          transition: 0.3s all;
          content: '';
          width: 30px;
          height: 1px;
          background-color: ${({ theme }) => theme.selectedColor};
        }
        color: ${({ theme }) => theme.selectedColor};
      }
    }
  }
`

export const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  position: relative;

  p {
    margin: 0;
  }

  &.icon-first {
    padding-left: 50px;

    > .img-wrapper,
    svg {
      height: 35px;
      width: 35px;
      position: absolute;
      top: 0;
      left: 0;
      fill: ${({ theme }) => theme.subHeadingText};

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.subHeadingText};
  }

  .value {
    display: flex;
    color: ${({ theme }) => theme.primaryText};
    font-weight: 600;
    font-size: 16px;
    column-gap: 4px;
    height: 36px;
    align-items: center;

    svg,
    .image-wrapper {
      width: 24px;
      height: 24px;
      margin-right: 7px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      fill: ${({ theme }) => theme.primaryText};
    }

    .impact {
      border-radius: 5px;
      font-weight: 400;
      font-size: 12px;
      padding: 3px 3px;
      height: fit-content;
      min-width: 55px;
      display: flex;
      justify-content: center;
      align-items: center;

      &.up {
        color: ${({ theme }) => theme.upColor};
        background: rgba(52, 246, 106, 0.2);
      }

      &.down {
        color: ${({ theme }) => theme.downColor};
        background: rgba(255, 67, 67, 0.2);
      }

      &.neutral {
        color: ${({ theme }) => theme.primaryText};
        background: rgba(119, 164, 242, 0.2);
      }
    }
  }

  .converted {
    font-weight: 500;
    font-size: 12px;
    display: flex;
    color: ${({ theme }) => theme.primaryText};
    column-gap: 4px;
    align-items: center;
    margin-top: -5px;
  }

  &.large {
    .name {
      font-size: 18px;
    }

    .value {
      font-weight: 700;
      font-size: 24px;
      .impact {
        font-size: 20px;
        padding: 2px 3px;
        margin-left: 5px;
      }
    }
  }
`

export const BlockName = styled(H2SimpleTitle)`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
`
export const BGPrimaryTitleStyled = styled(BGPrimaryTitle)`
  font-size: 22px;
`
