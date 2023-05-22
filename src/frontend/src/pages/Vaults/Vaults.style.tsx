import styled from 'styled-components/macro'

// components
import { Card } from 'styles'

// helpers
import {
  STATUS_FLAG_DOWN,
  STATUS_FLAG_INFO,
  STATUS_FLAG_UP,
  STATUS_FLAG_WAITING,
  STATUS_FLAG_WARNING,
} from 'app/App.components/StatusFlag/StatusFlag.constants'

// types
import { MavrykTheme } from '../../styles/interfaces'

export const VaultsStyled = styled.div<{ theme: MavrykTheme }>`
  .expand-borrow-tab {
    .expand-header {
      padding: 23px 30px 13px 30px;
      align-items: flex-start;
      grid-template-columns: 0.7fr 1fr 0.6fr 0.5fr 0.6fr 0.4fr;

      .sufix {
        margin-top: 8px;
      }

      .arrow-wrap {
        padding-bottom: 10px;
      }
    }
  }

  .tabSwitcher {
    margin-bottom: 0;
    width: 350px;
  }
`

export const VaultsSearchFilterWrapper = styled.div`
  .checkbox {
    margin: 20px 0;
  }
`

export const VaultsSearchFilterStyled = styled(Card)`
  padding: 20px 30px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;

  .search {
    max-width: 320px;
    margin: 0;
  }
`

export const VaultsFilters = styled.div`
  display: flex;

  .filter {
    display: flex;
    align-items: center;
    margin-left: 20px;

    h4 {
      margin: 0 10px 0 0;

      font-weight: 700;
      font-size: 14px;
      line-height: 14px;

      white-space: nowrap;
      color: ${({ theme }) => theme.textColor};
    }

    .assetsFilter {
      width: 275px;
    }
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

        &:last-of-type {
          margin-bottom: 0;
        }

        > div {
          min-width: 130px;
        }
      }
    }

    .right-part {
      padding-left: 30px;
      border-left: 1px solid ${({ theme }) => theme.cardBorderColor};

      h1 {
        margin-bottom: 14px;
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

      &.disabled {
        &:hover {
          border: none;
          color: ${({ theme }) => theme.containerColor};
        }
      }
    }

    .timer {
      display: inline-block;
      color: ${({ theme }) => theme.dataColor};
    }
  }

  .info-icon {
    position: relative;
    bottom: 2px;

    svg {
      fill: ${({ theme }) => theme.textColor};
    }
  }

  .${STATUS_FLAG_UP} {
    color: ${({ theme }) => theme.upColor};
  }

  .${STATUS_FLAG_DOWN} {
    color: ${({ theme }) => theme.downColor};
  }

  .${STATUS_FLAG_INFO} {
    color: ${({ theme }) => theme.infoColor};
  }

  .${STATUS_FLAG_WARNING} {
    color: ${({ theme }) => theme.warningColor};
  }

  .${STATUS_FLAG_WAITING} {
    color: ${({ theme }) => theme.riskColor};
  }
`
