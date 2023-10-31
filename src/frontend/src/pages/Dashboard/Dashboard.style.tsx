import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { BGPrimaryTitle } from 'pages/ContractStatuses/ContractStatuses.style'
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
    width: fit-content;
    font-weight: 600;
    font-size: 22px;
    column-gap: 4px;
    height: 36px;
    align-items: center;
    position: relative;

    svg,
    .img-wrapper {
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
      }
    }
  }
`

export const BlockName = styled(H2SimpleTitle)`
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;

  display: flex;
  align-items: center;
`
export const BGPrimaryTitleStyled = styled(BGPrimaryTitle)`
  font-size: 22px;
`
