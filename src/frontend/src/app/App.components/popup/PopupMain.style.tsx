import styled, { css } from 'styled-components'
import { MavenTheme } from 'styles/interfaces'

// TODO: extract all classname styles to it's own bases af for farms
export const PopupContainerWrapper = styled.div<{ theme: MavenTheme; $widthSize?: 586 | 750 | 395 | 950 | 420 }>`
  display: flex;
  flex-direction: column;
  padding: 40px;
  background: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.linksAndButtons};
  border-radius: 10px;
  height: fit-content;
  max-width: ${({ $widthSize = 395 }) => `${$widthSize}px`};
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
    top: 10px;
    right: 10px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:before {
      content: '✕';
      font-size: 30px;
      color: ${({ theme }) => theme.linksAndButtons};
    }

    &:hover {
      opacity: 0.8;
    }
  }

  &.loans {
    max-width: 586px;
    padding: 30px 40px 40px;
  }

  &.vaults {
    max-width: 586px;
    padding: 30px 40px;

    max-height: 95%;
    overflow-y: auto;
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

    p,
    li {
      color: ${({ theme }) => theme.regularText};
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

export const PopupContainer = styled.div<{ $show?: boolean }>`
  width: 100vw;
  height: 100vh;

  background-color: ${({ theme }) => theme.popupBackdropColor};
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  transition: opacity 0.35s, visibility 0.35s;

  overscroll-behavior: contain;
  overflow-y: auto;

  opacity: 0;
  visibility: hidden;

  > div {
    display: none;
  }

  ${({ $show }) =>
    $show
      ? css`
          opacity: 1;
          visibility: visible;

          > div {
            display: flex;
          }
        `
      : ''}
`

export const PopupContentWrapperBase = styled.div<{ theme: MavenTheme }>`
  background: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.linksAndButtons};
  border-radius: 10px;
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .close-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:before {
      content: '✕';
      font-size: 30px;
      color: ${({ theme }) => theme.linksAndButtons};
    }

    &:hover {
      opacity: 0.8;
    }
  }
`
