import styled from 'styled-components/macro'
import { Card, cyanColor } from 'styles'
import { TzAddress as TzAddressBase } from 'app/App.components/TzAddress/TzAddress.view'
import { MavrykTheme } from 'styles/interfaces'

export const TreasuryViewStyle = styled(Card)<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: auto 254px 184px;
  column-gap: 50px;
  padding-bottom: 33px;
  position: relative;

  .content-wrapper {
    max-width: 480px;

    .treasury-checkbox {
      margin-top: 25px;
      margin-bottom: -15px;
    }

    .no-treasury-table-data {
      p {
        margin: 0;
        margin-top: 15px;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }

  .pie-chart {
    display: flex;
    align-items: center;
  }

  .treasuryTooltip-link {
    position: absolute;
    right: 10px;
    top: 10px;

    .treasuryTooltip {
      width: 12px;
      height: 12px;
      border-color: ${cyanColor};

      svg {
        fill: ${cyanColor};
      }
    }
  }

  header {
    display: flex;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 3px;
    padding-bottom: 3px;

    h1 {
      margin: 0;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-transform: capitalize;

      font-weight: 600;
      font-size: 22px;
      line-height: 22px;
    }
  }

  var {
    color: ${({ theme }) => theme.dataColor};
    font-style: normal;
    font-weight: 600;
    font-size: 22px;
    padding-bottom: 13px;
    white-space: nowrap;
  }

  .info-block {
    display: flex;
    align-items: center;
    margin: 7px 0 50px 0;

    grid-column-start: 2;
    grid-column-end: 4;

    p {
      margin: 0;
    }

    .text {
      margin-right: 30px;
      color: ${({ theme }) => theme.textColor};
    }

    .tzAddressToClick {
      font-size: 16px;
      font-weight: 600;
      svg {
        stroke: ${({ theme }) => theme.dataColor};
      }
    }

    .value {
      margin-top: 0;
      color: ${({ theme }) => theme.dataColor};

      svg {
        stroke: ${({ theme }) => theme.dataColor};
      }
    }

    > .text,
    .value {
      font-weight: 600;
      font-size: 22px;
      line-height: 22px;
    }
  }

  .address-block {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    grid-column-start: 2;
    grid-column-end: 4;

    .text {
      margin-right: 10px;

      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
    }

    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
    }
  }

  .asset-lables {
    padding-top: 20px;
    max-height: 242px;
    overflow: auto;
    padding-right: 16px;
  }

  .asset-lable {
    background: linear-gradient(90deg, #0d61ff 0%, rgba(133, 211, 200, 0) 100%);
    padding-top: 1px;
    padding-bottom: 1px;
    border-bottom-left-radius: 6px;
    border-top-left-radius: 6px;
    margin: 11px 0;
  }

  .asset-lable-text {
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${({ theme }) => theme.textColor};
    background-color: ${({ theme }) => theme.containerColor};
    margin: 0;
    margin-left: 8px;
    line-height: 40px;
    padding-left: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .assets-map {
    max-height: 132px;
    overflow: auto;
  }
`

export const TreasuryActiveStyle = styled.section``
export const TreasurySelectStyle = styled(Card)<{ isSelectedTreasury?: boolean }>`
  display: flex;
  border-bottom-left-radius: ${({ isSelectedTreasury }) => (isSelectedTreasury ? 0 : '10px')};
  border-bottom-right-radius: ${({ isSelectedTreasury }) => (isSelectedTreasury ? 0 : '10px')};
  align-items: center;
  margin-top: 20px;
  padding-top: 17px;
  padding-bottom: 17px;

  & + div {
    margin-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
  }

  h2 {
    font-weight: 600;
    font-size: 22px;
    line-height: 22px;
    color: ${({ theme }) => theme.textColor};

    &::after {
      display: none;
    }

    & + div {
      width: 502px;
      margin-left: auto;
      margin-right: 0;
    }
  }
`
