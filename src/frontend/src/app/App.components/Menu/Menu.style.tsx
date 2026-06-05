import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MENU_Z_INDEX, Z_INDEX_DEFAULT } from 'styles/constants'

import { MavenTheme } from '../../../styles/interfaces'

export const MenuSidebarStyled = styled.div<{ theme: MavenTheme }>`
  max-width: 210px;
  width: 100vw;
  transition: 0.6s all;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .mobile-logo {
    display: none;
  }

  > div {
    transition: 0.6s all;
    width: 100%;
    max-width: 210px;
    height: fit-content;
  }

  .menu-backdrop {
    display: none;
  }

  @media screen and (max-width: 1399px) {
    top: 0;
    left: 0;
    z-index: ${MENU_Z_INDEX};
    transition: all 0.3s;

    &.menu-expanded {
      max-width: 100vw;
      display: flex;
      background: ${({ theme }) => theme.menuBackdropColor};
      z-index: ${MENU_Z_INDEX};
      align-items: flex-start;

      .menu-backdrop {
        display: block;
      }
    }

    &:not(.menu-expanded) {
      max-width: 72px;

      a .navLinkSubTitle,
      a .navLinkTitle {
        display: none !important;
      }
    }
  }

  @media screen and (max-width: 450px) {
    &:not(.menu-expanded) {
      max-width: 0;
    }

    &.menu-expanded {
      max-width: 100vw;
    }

    > div {
      width: 100vw;
      max-width: 100vw;
      height: fit-content;
    }
  }
`

export const MenuSidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 210px;
  height: 100%;
  background-color: ${({ theme }) => theme.cards};
  padding-top: 110px;
  transition: 0.6s all;
  height: fit-content;
  min-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`
export const MenuLogo = styled.img`
  z-index: ${Z_INDEX_DEFAULT};
  width: 180px;
  height: 36px;

  &.mobile-logo {
    display: none;
  }

  @media screen and (max-width: 1400px) {
    width: 140px;
    height: 28px;
  }

  @media screen and (max-width: 940px) {
    &.desktop-logo {
      display: none;
    }

    &.mobile-logo {
      display: block;
      width: fit-content;
    }
  }
`

export const MenuGrid = styled.div`
  display: flex;
  align-items: start;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
  margin-bottom: 50px;
`

export const MenuFooter = styled.div<{ theme: MavenTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${FontSize.xs};
  font-weight: ${FontWeight.semibold};
  padding: 0 14px;
  row-gap: 20px;

  span {
    font-weight: ${FontWeight.medium};
    font-size: ${FontSize.sm};

    margin-bottom: 20px;
    color: ${({ theme }) => theme.linksAndButtons};
  }

  > a {
    width: 100%;

    &.small {
      width: fit-content;
    }
  }

  .social-wrapper {
    display: flex;
    column-gap: 12px;
    align-items: center;

    a {
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.7;
      transition: opacity 0.15s ease-in-out;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 18px;
        height: 18px;
        fill: ${({ theme }) => theme.linksAndButtons};
      }
    }

    a:first-of-type svg {
      width: 16px;
      height: 16px;
    }
  }

  @media screen and (max-width: 1460px) {
    padding: 0 10px;
    font-size: ${FontSize.xxs};
  }

  &.menu-collapsed {
    .feedbackLink {
      width: auto;
    }

    .social-wrapper {
      align-items: center;
      row-gap: 7px;
      flex-direction: column;
    }
  }
`

export const MenuSpacerDiv = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
`
