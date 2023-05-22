import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { STATUS_FLAG_INFO } from 'app/App.components/StatusFlag/StatusFlag.constants'

export const NoItemsInTabStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin-bottom: 30px;
  margin-top: 15px;
  align-items: center;

  span {
    font-weight: 600;
    font-size: 16px;
    color: ${({ theme }) => theme.textColor};
  }

  .lending-tab-no-items-btn {
    max-width: 250px;

    svg {
      stroke: unset;
    }
  }
`

export const LendingTabStyled = styled.div<{ theme: MavrykTheme }>`
  .main {
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
  }

  .has-items-borrow-btn {
    max-width: 250px;
  }
`

export const VaultsList = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  &:has(.expandedCard) {
    .expand-borrow-tab {
      opacity: 0.3;
      pointer-events: none;
    }

    .expandedCard {
      opacity: 1;
      pointer-events: auto;
    }
  }
`

export const BorrowingTabListItemExpanded = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 30px;
  row-gap: 30px;

  background-color: ${({ theme }) => theme.containerColor};
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;

  .useMax-btn {
    button {
      font-size: 14px;
    }
  }

  .top {
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

  .block-name {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.textColor};
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

    .buttons-wrapper {
      display: grid;
      grid-template-columns: 180px 180px;
      column-gap: 10px;
      margin-left: auto;
    }
  }

  .bottom-info-row {
    display: flex;
    align-items: center;
    width: 400px;
    margin: 6px 0;

    .name {
      margin-right: 10px;
    }

    .value {
      color: ${({ theme }) => theme.dataColor};
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      column-gap: 6px;
    }

    /* TODO: remove button styles from here */
    button,
    a {
      margin-left: auto;
      padding: 0;
      height: fit-content;

      &:hover {
        opacity: 0.8;
        color: ${({ theme }) => theme.valueColor};

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
        stroke: ${({ theme }) => theme.valueColor};
      }
    }
  }

  .close-vault {
    position: absolute;
    right: 18px;
    bottom: 20px;
    width: 250px;
    height: 36px;

    > div {
      display: flex;
      align-items: center;
    }

    svg {
      width: 15px;
      height: 15px;
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

  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;

  .coming-soon {
    text-align: center;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    color: ${({ theme }) => theme.textColor};
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

    color: ${({ theme }) => theme.textColor};
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

export const LoansValuesSection = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 60px;
  padding: 30px;

  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;

  &.secondary-background {
    background-color: ${({ theme }) => theme.containerColor};
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 30px;
    row-gap: 60px;
  }
`

export const LoansValuesSectionInfo = styled.div<{
  theme: MavrykTheme
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

    color: ${({ theme }) => theme.textColor};
  }

  .value {
    font-weight: 700;
    font-size: 30px;
    line-height: 40px;
    word-break: break-all;

    color: ${({ theme }) => theme.dataColor};
  }

  .rate {
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;

    visibility: ${({ theme }) => (theme.hasRate ? 'hidden' : 'visible')};
    color: ${({ theme }) => theme.dataColor};
  }

  .margin-top {
    margin-top: 18px;
  }

  &.learn-more {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    a {
      color: ${({ theme }) => theme.valueColor};
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
      color: ${({ theme, customColor }) => customColor ?? theme.textColor};

      p {
        margin-left: 5px;
      }
    }

    .copyIcon {
      font-weight: 600;
    }
  }
`

export const BorrowingTabListItemTabInfo = styled.div<{ theme: MavrykTheme }>`
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

    color: ${({ theme }) => theme.textColor};
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
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      display: flex;
      align-items: center;
      column-gap: 6px;

      font-size: 16px;
      color: ${({ theme }) => theme.dataColor};
    }

    /* TODO: remove button styles from here */
    button,
    a {
      margin-left: auto;
      padding: 0;
      height: fit-content;

      &:hover {
        opacity: 0.8;
        color: ${({ theme }) => theme.valueColor};

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
        stroke: ${({ theme }) => theme.valueColor};
      }
    }
  }
`

export const VaultOverview = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 25px;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
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

export const StatusMessageStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  column-gap: 20px;
  padding: 15px 25px;
  background-color: ${({ theme }) => theme.dPurple_container_dPurple};
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  border-radius: 10px;
  background-color: ${({ theme }) => theme.darkPurpleColor};

  .timer {
    display: inline-block;
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

  & > div {
    p {
      margin: 0;
    }

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
    border: 1px solid ${({ theme }) => theme.headerColor};

    svg {
      fill: ${({ theme }) => theme.headerColor};
    }
  }
`
