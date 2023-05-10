import styled, { css } from 'styled-components/macro'
import { cyanColor, dropDownColor, royalPurpleColor } from 'styles'
import { Button as ButtonBase } from '../Button/Button.controller'
import { MavrykTheme } from '../../../styles/interfaces'

export const PopupContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  background: #160e3f;
  border: 1px solid #86d4c9;
  border-radius: 10px;
  height: fit-content;
  max-width: 395px;
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media (max-width: 1165px) {
    width: 95vw;
    padding: 40px 20px;
  }

  .close-modal {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:before {
      content: '✕';
      font-size: 25px;
      color: ${({ theme }) => theme.textColor};
    }

    &:hover {
      opacity: 0.7;
    }
  }

  &.settings {
    .theme-switcher-block {
      display: flex;
      flex-direction: column;
      row-gap: 30px;
      margin-top: 40px;

      .buttons-wrapper {
        display: flex;
        justify-content: space-between;
      }
    }
  }

  &.loans {
    max-width: 586px;
    padding: 30px 40px 40px;
  }

  &.vaults {
    max-width: 586px;
    padding: 30px 40px;
  }

  &.child-width {
    max-width: unset;
    width: fit-content;
  }

  &.council {
    max-width: 750px;
    padding: 0;
  }

  &.council__request-purpose {
    max-width: 586px;
    padding: 30px 50px;
  }

  &.exitFee {
    padding: 30px 40px 50px;
    width: 586px;
    max-width: unset;

    h1 {
      margin: 0;
      text-align: start;
    }
  }

  &.wert-io-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 535px;
    width: 100%;
    height: 660px;

    @media (max-width: 550px) {
      width: 100vw;
      height: 100vh !important;
    }
  }

  &.policy {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 40px 50px 30px;
    max-width: 950px;

    h1,
    p,
    ol {
      margin: 0;
    }

    ol {
      padding-left: 15px;
    }

    h1:after {
      margin-bottom: 30px;
    }

    p,
    h3,
    li {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
    }

    li,
    div {
      font-weight: 500;
      line-height: 24px;
    }

    .procced-btn {
      width: 270px;
      margin: 0 auto;
      padding-top: 30px;
    }
  }

  @media (max-width: 500px) {
    &.settings {
      .theme-switcher-block {
        display: flex;
        flex-direction: column;
        row-gap: 15px;
        margin-top: 20px;

        .buttons-wrapper {
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
`

export const ChangeNodeNodesList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 18px;
  max-height: 200px;
  height: fit-content;
  overflow-y: auto;
  padding-right: 10px;
`

export const ChangeNodeNodesListItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 20px;
  font-weight: 600;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.textColor};
  margin-top: 12px;
  border-radius: 10px;
  cursor: pointer;
  border: ${({ isSelected }) => (isSelected ? `1px solid ${cyanColor}` : `1px solid ${royalPurpleColor};`)};

  &.add_node {
    width: calc(100% - 10px);
    margin-top: 25px;
    justify-content: space-between;
    cursor: default;

    .add-new-node-handler {
      width: 100%;
      font-weight: 600;
      font-size: 18px;
      line-height: 18px;
      color: ${({ theme }) => theme.textColor};
      white-space: nowrap;
      margin-right: 10px;
    }

    input {
      width: 100%;
      border: none;
      padding-left: 7px;
      color: ${({ theme }) => theme.textColor};
      font-size: 16px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;

      &::placeholder {
        color: ${({ theme }) => theme.textColor};
      }
    }

    &.expanded {
      .add-new-node-handler {
        display: none;
      }
    }
  }

  span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .user-url {
    color: #6a6a9b;
    font-size: 16px;
  }

  .img_wrapper {
    height: 35px;
    width: 35px;
    margin-right: 18px;
    font-size: 10px;

    img {
      height: 100%;
      object-fit: contain;
    }
  }

  @media (max-width: 500px) {
    padding: 15px 20px;
    &.add_node {
      margin-top: 15px;
    }
  }
`

export const PopupContainer = styled.div<{ show?: boolean }>`
  width: 100vw;
  height: 100vh;
  background-color: ${dropDownColor};
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.35s, visibility 0.35s;
  overscroll-behavior: contain;
  overflow-y: auto;

  > div {
    display: none;
  }

  ${({ show }) =>
    show
      ? css`
          opacity: 1;
          visibility: visible;

          > div {
            display: flex;
          }
        `
      : ''}
`

export const SettingsPopupWrapper = styled.div`
  .title {
    font-weight: 700;
    font-size: 25px;
    line-height: 25px;
    color: ${({ theme }) => theme.textColor};
    text-align: center;
  }

  .buttons-wrapper {
    display: flex;
    column-gap: 7px;
  }
`

export const DescrText = styled.div`
  max-width: 620px;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.textColor};
  margin-top: 30px;

  &.change_node {
    text-align: center;
    padding: 0 10px;
    font-size: 14px;
  }

  @media (max-width: 500px) {
    font-size: 14px;
  }
`

export const Button = styled(ButtonBase)<{ theme: MavrykTheme }>`
  &.theme-btn {
    color: ${({ theme }) => theme.textColor};

    &:hover,
    &.selected {
      border: 1px solid ${({ theme }) => theme.actionPrimaryBtnColor};
      color: ${({ theme }) => theme.actionPrimaryBtnColor};
    }
  }

  &.disabled {
    &:hover {
      border: 1px solid ${({ theme }) => theme.cardBorderColor};
      color: ${({ theme }) => theme.textColor};
    }
  }
`
