import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'

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
      border: 1px solid #503eaa;
      padding: 25px 0 0 30px;
      border-radius: 10px;

      h1 {
        color: ${({ theme }) => theme.textColor};

        &:after {
          background-color: ${({ theme }) => theme.textColor};
        }
      }
    }

    .tvlBlock {
      background-image: url('/images/dashboard/dashboardTVLbg.svg?v=0'), ${({ theme }) => theme.dashboardTvlGradient};
      background-size: cover;
      background-repeat: no-repeat;

      > div {
        font-weight: 600;
        font-size: 32px;
        color: ${({ theme }) => theme.dataColor};
        margin-top: 30px;
      }
    }

    .mvkStats {
      background-color: ${({ theme }) => theme.containerColor};

      .statsWrapper {
        margin-top: 15px;
        display: grid;
        grid-template-columns: repeat(3, auto);
        column-gap: 30px;
        row-gap: 20px;

        > div {
          row-gap: 0;
        }

        .impact-wrapper {
          margin-left: 5px;
        }

        .value {
          font-size: 16px;
        }
      }
    }
  }

  .dashboard-navigation {
    display: flex;
    margin: 30px 0 20px 0;
    column-gap: 20px;

    > a {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      position: relative;
      transition: 0.3s all;
      color: ${({ theme }) => theme.navTitleColor};

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
          background-color: ${({ theme }) => theme.navLinkSubTitleActive};
        }
        color: ${({ theme }) => theme.navLinkSubTitleActive};
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
      fill: ${({ theme }) => theme.textColor};

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
    color: ${({ theme }) => theme.textColor};
  }

  .value {
    display: flex;
    width: fit-content;
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 22px;
    column-gap: 4px;
    height: 36px;
    align-items: center;
    position: relative;

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

      fill: ${({ theme }) => theme.dataColor};
    }
  }

  .converted {
    font-weight: 500;
    font-size: 12px;
    display: flex;
    color: ${({ theme }) => theme.dataColor};
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
      }
    }
  }
`

export const BlockName = styled.div`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.textColor};
`
export const BGPrimaryTitleStyled = styled(BGPrimaryTitle)`
  font-size: 22px;
`
