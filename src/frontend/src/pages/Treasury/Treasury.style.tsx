import styled from 'styled-components'
import { Card } from 'styles'
import { MavenTheme } from 'styles/interfaces'

export const TreasuryViewStyle = styled(Card)<{ theme: MavenTheme }>`
  display: grid;
  grid-template-columns: auto 254px 184px;
  column-gap: 50px;
  padding-bottom: 33px;
  position: relative;

  .content-wrapper {
    max-width: 480px;

    .treasury-checkbox-wrapper {
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
      color: ${({ theme }) => theme.mainHeadingText};

      display: flex;
      align-items: center;
    }

    .tzAddressToClick {
      font-size: 16px;
      font-weight: 600;
    }

    .value {
      margin-top: 0;
      color: ${({ theme }) => theme.primaryText};
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

      color: ${({ theme }) => theme.mainHeadingText};
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
    color: ${({ theme }) => theme.regularText};
    background-color: ${({ theme }) => theme.cards};
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
export const TreasurySelectStyle = styled(Card)<{ $isSelectedTreasury?: boolean }>`
  display: flex;
  border-bottom-left-radius: ${({ $isSelectedTreasury }) => ($isSelectedTreasury ? 0 : '10px')};
  border-bottom-right-radius: ${({ $isSelectedTreasury }) => ($isSelectedTreasury ? 0 : '10px')};
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
    color: ${({ theme }) => theme.mainHeadingText};

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
