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

    &:after,
    &:before {
      content: '';
      height: 2px;
      width: 24px;
      background-color: ${({ theme }) => theme.textColor};
      position: absolute;
    }

    &:after {
      top: 15px;
      right: -2px;
      transform: rotate(-180deg);
    }

    &:before {
      top: 15px;
      right: -2px;
      transform: rotate(90deg);
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

  &.exitFee {
    padding: 30px 40px 50px;
    width: 586px;
    max-width: unset;

    h1 {
      margin: 0;
      text-align: start;
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
      padding: 0;
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

  .close-modal {
    font-size: 50px;
    font-weight: 100;
    height: 24px;
    width: 24px;
    color: ${({ theme }) => theme.textColor};
    transform: rotate(45deg);
    cursor: pointer;
    transition: color 300ms;
    position: absolute;
    top: 5px;
    right: 10px;

    &:hover {
      color: ${({ theme }) => theme.textColorHovered};
    }
  }

  .wert-io-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 535px;
    width: 100%;
    height: 660px;

    .close-modal {
      position: absolute;
      font-size: 60px;
      font-weight: 100;
      height: 35px;
      width: 35px;
      color: #8d86eb;
      transform: unset;
      top: 5px;
      right: 15px;
      cursor: pointer;
    }

    @media (max-width: 550px) {
      width: 100vw;
      height: 100vh !important;
    }
  }
`

export const PopupTitle = styled.div`
  font-weight: 700;
  font-size: 25px;
  line-height: 25px;
  color: ${({ theme }) => theme.textColor};
  position: relative;

  &.change_node {
    margin: 0 auto;
    width: fit-content;
    &::before {
      display: none;
    }
  }

  &::before {
    content: '';
    width: 77px;
    height: 4px;
    background: #503eaa;
    position: absolute;
    bottom: -10px;
    left: 0;
  }

  @media (max-width: 500px) {
    font-size: 20px;
    /* text-align: center; */

    &::before {
      height: 2px;
    }
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
