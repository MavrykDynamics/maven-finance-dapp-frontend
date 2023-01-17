import styled from 'styled-components/macro'

// components
import { Card } from 'styles'

// helpers
import { DOWN, INFO, PRIMARY, UP, WAITING, WARNING, DARK_WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const VaultsStyled = styled.div<{ theme: MavrykTheme }>`
  .group-with-icon {
    display: flex;

    > svg {
      margin-right: 10px;
      width: 36px;
      height: 36px;
    }

    .img-wrapper, .no-icon {
      margin-right: 10px;
      width: 36px;
      height: 36px;

      img,
      svg {
        fill: ${({ theme }) => theme.dataColor};
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .expand-vault {
    margin-top: 10px;

    .expand-header {
      padding: 0 30px;
      grid-template-columns: 185px 210px 120px 120px 0.4fr 0.4fr;
      column-gap: 40px;
    }

    .expand-borrow-tab-container {
      background-color: ${({ theme }) => theme.containerColor};
      border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
    }
  }

  .tabSwitcher {
    margin-bottom: 0;
    width: 175px; 
  }
`

export const VaultsSearchFilterStyled = styled(Card)`
  padding: 20px 30px;
  margin: 20px 0;
  display: flex;

  input {
    width: 320px;
  }

  .dd-container {
    display: grid;
    grid-template-columns: 70px 180px 180px 180px;
    column-gap: 20px;

    h4 {
      margin: 0;
    }

    .dd-item {
      div {
        width: 180px;
      }
    }
  }
`

export const VaultsCardTitleTextGroup = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 5px;

  > h2 {
    height: 18px;
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.dataColor};
    text-transform: capitalize;

    &::after {
      height: 0;
    }
  }

  > h3 {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.textColor};
    text-transform: capitalize;
  }

  .header-value {
    color: ${({ theme }) => theme.dataColor};

    p {
      margin: 0;
    }
  }

  .ratio {
    height: 14px;
  }

  .rate {
    position: absolute;
    top: 27px;

    font-weight: 400;
    font-size: 12px;
    line-height: 18px;

    color: ${({ theme }) => theme.dataColor};
  }
`

export const VaultsCardDropDown = styled.div<{ theme: MavrykTheme }>`
  padding: 30px;
  padding-bottom: 0;

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  .body {
    display: grid;
    grid-template-columns: 50% 50%;
    margin-bottom: 30px;

    h1 {
      margin: 0;
      margin-bottom: 30px;
    }

    .left-part {
      padding-right: 30px;

      .group {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;

        > div {
          min-width: 130px;
        }
      }
    }

    .right-part {
      padding-left: 30px;
      border-left: 1px solid ${({ theme }) => theme.cardBorderColor};

      h1 {
        margin-bottom: 20px;
      }

      .table-size {
        height: 160px;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 15px;
          background-color: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background-clip: padding-box;
          border-left: 5px solid rgba(0, 0, 0, 0);
          border-right: 5px solid rgba(0, 0, 0, 0);
          border-radius: 6px;
          -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
          background-color: ${({ theme }) => theme.cardBorderColor};
        }
      }
    }

    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;

      color: ${({ theme }) => theme.dataColor};

      p {
        margin: 0;
      }
    }

    .title {
      display: flex;
      align-items: center;
    }

    .info-icon {
      margin-left: 4px;
      width: 12px;
      height: 12px;
      fill: ${({ theme }) => theme.textColor};
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

    button {
      width: 250px;
    }

    .timer {
      color: ${({ theme }) => theme.dataColor};
    }
  }

  .${PRIMARY} {
    color: ${({ theme }) => theme.infoColor};
  }

  .${UP} {
    color: ${({ theme }) => theme.upColor};
  }

  .${DOWN} {
    color: ${({ theme }) => theme.downColor};
  }

  .${INFO} {
    color: ${({ theme }) => theme.infoColor};
  }

  .${WARNING} {
    color: ${({ theme }) => theme.warningColor};
  }

  .${DARK_WARNING} {
    color: ${({ theme }) => theme.darkWarningColor};
  }

  .${WAITING} {
    color: ${({ theme }) => theme.awaitingColor};
  }
`

export const VaultsAssest = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    th {
      text-align: start;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid ${({ theme }) => theme.cardBorderColor};

      &:last-of-type {
        border: none;
      }

      td {
        position: relative;
        width: 40%;

        font-weight: 600;
        font-size: 16px;
        line-height: 22px;

        color: ${({ theme }) => theme.dataColor};

        div {
          display: flex;
          align-items: center;
        }

        .rate {
          position: absolute;
          top: 27px;

          font-weight: 400;
          font-size: 12px;
          line-height: 18px;

          color: ${({ theme }) => theme.dataColor};

          p {
            margin: 0;
          }
        }

        .img-wrapper,
        .no-icon {
          width: 24px;
          height: 24px;
          margin-right: 5px;

          img,
          svg {
            fill: ${({ theme }) => theme.dataColor};
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }

  svg {
    margin-right: 4px;
    width: 24px;
    height: 24px;
  }
`