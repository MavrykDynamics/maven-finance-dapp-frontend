import styled from 'styled-components'
import { MavenTheme } from 'styles/interfaces'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { STATUS_FLAG_INFO } from 'app/App.components/StatusFlag/StatusFlag.constants'

export const NoItemsInTabStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin-bottom: 30px;
  margin-top: 15px;
  align-items: center;

  span {
    font-weight: 600;
    font-size: 16px;
    color: ${({ theme }) => theme.regularText};
  }

  .manage-btn {
    width: 250px;
  }

  .lending-tab-no-items-btn {
    max-width: 250px;

    svg {
      stroke: unset;
    }
  }
`

export const LendingTabStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 40px;

  .stats-and-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 20px;
  }
`

export const BorrowingTabStyled = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;

  .title-block {
    display: flex;
    justify-content: space-between;
    align-items: end;

    display: grid;
    grid-template-columns: auto 250px;
  }
`

export const VaultsList = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  &:has(.expanded-card) {
    .expand-borrow-tab {
      opacity: 0.3;
      pointer-events: none;
    }

    .expanded-card {
      opacity: 1;
      pointer-events: auto;
    }
  }
`

export const BorrowingExpandedCard = styled.div<{ theme: MavenTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 30px;
  row-gap: 30px;

  background-color: ${({ theme }) => theme.cards};
  border-top: 1px solid ${({ theme }) => theme.divider};
  border-radius: 10px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;

  .stats-and-actions {
    display: grid;
    grid-template-columns: 450px auto;
    column-gap: 20px;
  }

  .menu-switcher {
    width: fit-content;
    column-gap: 20px;
  }

  .action-switchers {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    margin: 0 auto;
  }

  // styles below useing only in OldBorrowingExpandComponent
  .block-name {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.subHeadingText};
    margin-bottom: 10px;

    &.margin-top {
      margin-top: 60px;
    }

    &.margin-top-20 {
      margin-top: 20px;
    }
  }

  .borrowed-data {
    display: flex;

    > div:not(.buttons-wrapper) {
      width: 17%;
    }

    .name {
      color: ${({ theme }) => theme.mainHeadingText};
    }

    .buttons-wrapper {
      display: grid;
      grid-template-columns: 180px 180px;
      column-gap: 10px;
      margin-left: auto;
    }
  }

  .add-first-collateral {
    margin: 3px 0 0 auto;
    width: 270px;
  }

  .repay-full {
    position: absolute;
    right: 18px;
    bottom: 20px;
  }
`

export const LoansActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  padding: 30px;
  border-radius: 10px;

  &.borrowing-tab {
    background-color: ${({ theme }) => theme.backgroundColor};
  }

  &.lending-tab {
    background-color: ${({ theme }) => theme.cards};
    border: 1px solid ${({ theme }) => theme.divider};
  }

  .useMax-btn {
    button {
      font-size: 14px;
    }
  }

  .coming-soon {
    text-align: center;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    color: ${({ theme }) => theme.regularText};
  }

  .switchers {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 15px;
  }

  .tab-text {
    margin: 0 15px;

    font-weight: 600;
    font-size: 14px;
    line-height: 22px;

    color: ${({ theme }) => theme.regularText};

    &.center {
      text-align: center;
    }
  }

  .stats {
    display: flex;
    justify-content: space-between;
    padding: 20px 15px;

    border: 1px solid ${({ theme }) => theme.strokeCards};
    border-radius: 10px;
  }

  .button-wrapper {
    width: 300px;
    margin: 0 auto;
  }

  .mt-25 {
    margin-top: 25px;
  }

  .mb-10 {
    margin-bottom: 10px;
  }
`

export const LoansValuesSection = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  padding: 30px;
  border-radius: 10px;

  &.borrowing-tab {
    row-gap: 60px;
    background-color: ${({ theme }) => theme.backgroundColor};

    .stats {
      row-gap: 60px;
    }
  }

  &.lending-tab {
    row-gap: 45px;
    background-color: ${({ theme }) => theme.cards};
    border: 1px solid ${({ theme }) => theme.divider};

    .stats {
      row-gap: 45px;
    }
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 30px;
  }
`

export const LoansValuesSectionInfo = styled.div<{
  theme: MavenTheme
  hasRate?: boolean
  customColor?: string
}>`
  p {
    margin: 0;
  }

  .name {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    color: ${({ theme }) => theme.subHeadingText};
  }

  .value {
    font-weight: 700;
    font-size: 30px;
    line-height: 40px;
    word-break: break-all;

    color: ${({ theme }) => theme.primaryText};
  }

  .rate {
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;

    visibility: ${({ theme }) => (theme.hasRate ? 'hidden' : 'visible')};
    color: ${({ theme }) => theme.primaryText};
  }

  .margin-top {
    margin-top: 18px;
  }

  &.learn-more {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    a {
      color: ${({ theme }) => theme.linksAndButtons};
    }
  }

  &.collateral-diagram {
    .percentage {
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      margin-bottom: 7px;
      color: ${({ theme, customColor }) => customColor ?? theme.subHeadingText};

      p {
        margin-left: 5px;
      }
    }

    .copyIcon {
      font-weight: 600;
    }
  }
`

export const BorrowingTabListItemTabInfo = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  padding: 30px;
  row-gap: 30px;

  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;

  .tab-header {
    display: grid;
    grid-template-columns: auto 250px;
  }

  .useful-info {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }

  .useful-info-title {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    color: ${({ theme }) => theme.subHeadingText};
  }

  .useful-info-line {
    display: flex;
    align-items: center;
    width: 400px;

    a,
    button,
    .name,
    .value {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
    }

    .name {
      margin-right: 10px;
      color: ${({ theme }) => theme.subHeadingText};

      display: flex;
      align-items: center;
    }

    .value {
      display: flex;
      align-items: center;
      column-gap: 6px;

      color: ${({ theme }) => theme.primaryText};
    }

    /* TODO: remove button styles from here */
    > button,
    a {
      margin-left: auto;
      padding: 0;
      height: fit-content;

      &:hover {
        opacity: 0.8;
        color: ${({ theme }) => theme.linksAndButtons};

        svg {
          opacity: 0.8;
        }

        &::before {
          display: none;
        }
      }

      svg {
        height: 14px;
        width: 8px;
        transform: rotate(180deg);
        stroke-width: 2px;
        stroke: ${({ theme }) => theme.linksAndButtons};
      }
    }
  }
`

export const VaultOverview = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 25px;
  border: 1px solid ${({ theme }) => theme.strokeCards};
  padding: 20px 15px;
  border-radius: 10px;

  .line {
    display: flex;
    justify-content: space-between;
  }

  .collateral-diagram {
    .diagram {
      width: 210px;
    }

    .copyIcon {
      font-weight: 600;
    }
  }
`

export const StatusMessageStyled = styled.div<{ theme: MavenTheme }>`
  display: flex;
  align-items: center;
  column-gap: 20px;
  padding: 15px 25px;
  background-color: ${({ theme }) => theme.messagesBackground};
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  border-radius: 10px;

  .timer {
    display: inline-block;
  }

  .no-data {
    color: ${({ theme }) => theme.primaryText};
  }

  &.borrow-message {
    margin: 40px 0 40px 0;
  }

  &.repay-in-full {
    border: 1px solid ${({ theme }) => theme.infoColor};

    svg {
      width: 16px;
      height: 16px;
      fill: ${({ theme }) => theme.infoColor};
    }
  }

  svg {
    width: 50px;
    height: 20px;
  }

  p {
    margin: 0;
  }

  & > div {
    p:first-of-type {
      white-space: nowrap;
    }
  }

  &.${vaultsStatuses.LIQUIDATABLE} {
    border: 1px solid ${({ theme }) => theme.downColor};

    svg {
      fill: ${({ theme }) => theme.downColor};
    }
  }

  &.${vaultsStatuses.GRACE_PERIOD} {
    border: 1px solid ${({ theme }) => theme.warningColor};

    svg {
      fill: ${({ theme }) => theme.warningColor};
    }

    span {
      color: ${({ theme }) => theme.warningColor};
    }
  }

  &.${vaultsStatuses.AT_RISK} {
    border: 1px solid ${({ theme }) => theme.riskColor};

    svg {
      fill: ${({ theme }) => theme.riskColor};
    }
  }

  &.${STATUS_FLAG_INFO} {
    border: 1px solid ${({ theme }) => theme.infoColor};

    svg {
      fill: ${({ theme }) => theme.infoColor};
    }
  }
`

export const CardSectionWrapper = styled.div`
  .value {
    word-break: break-all;
  }
`
