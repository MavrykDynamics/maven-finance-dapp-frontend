import styled, { css } from 'styled-components/macro'

import { MavenTheme } from '../../../../styles/interfaces'

export const NavigationLinkContainer = styled.div<{
  selected: boolean
  isMobMenuExpanded: boolean
  theme: MavenTheme
}>`
  width: 100%;

  &:nth-of-type(1) {
    svg {
      stroke: ${({ theme }) => theme.menuButtonText};
    }
  }

  ${({ isMobMenuExpanded }) =>
    !isMobMenuExpanded
      ? css`
          display: flex;
          justify-content: center;
          align-items: center;

          .navLinkIcon,
          a {
            width: fit-content;
            margin: 0;
          }
        `
      : ''}

  ${(props) =>
    props.selected &&
    css`
      background: ${({ theme }) => theme.menuBackgroundActiveColor};
      color: ${({ theme }) => theme.menuButtonText};
      border-radius: 0 10px 10px 0;

      &:nth-of-type(1) {
        svg {
          stroke: ${({ theme }) => theme.menuButtonText};
        }
      }
    `}


    a {
    &.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
`

export const NavigationLinkItem = styled.div<{
  selected: boolean
  isMobMenuExpanded: boolean
  theme: MavenTheme
  disabled?: boolean
}>`
  width: 100%;

  ${({ disabled }) =>
    disabled
      ? css`
          cursor: not-allowed;
        `
      : ''}

  > a {
    display: flex;
    margin-left: 20px;

    .navLinkTitle {
      font-size: 16px;
      line-height: 31px;
      font-weight: 600;
      color: ${({ theme }) => theme.menuButtonText};
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    ${(props) =>
      props.selected &&
      css`
        .navLinkTitle {
          color: ${({ theme }) => theme.menuButtonText};
        }
      `}
  }

  ${({ isMobMenuExpanded }) =>
    !isMobMenuExpanded
      ? css`
          display: flex;
          justify-content: center;
          align-items: center;

          .navLinkIcon,
          > a {
            width: fit-content;
            margin: 0;
          }
        `
      : ''}
`
export const NavigationLinkIcon = styled.div<{ selected: boolean; theme: MavenTheme }>`
  width: 35px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  margin-right: 10px;

  > svg {
    display: inline-block;
    width: 27px;
    height: 50px;
    fill: ${({ theme }) => theme.menuButtonText};
    vertical-align: top;
  }

  ${(props) =>
    props.selected &&
    css`
      > svg {
        fill: ${({ theme }) => theme.menuButtonText};
      }
    `}
`

export const NavigationSubLinks = styled.div<{ theme: MavenTheme }>`
  background: ${({ theme }) => theme.backgroundColor};
`
export const SubNavLink = styled.div<{ theme: MavenTheme; disabled?: boolean }>`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;

  > a {
    display: flex;
    align-items: center;
    margin-left: 75px;
  }

  ${({ disabled }) =>
    disabled
      ? css`
          cursor: not-allowed;
        `
      : ''}
`

export const SubLinkText = styled.p<{ selected: boolean; theme: MavenTheme }>`
  font-size: 14px;
  line-height: 17px;
  font-weight: 500;
  text-align: left;
  position: relative;
  transition: 0.3s all;
  color: ${({ theme }) => theme.menuButtonText};

  ${(props) =>
    props.selected &&
    css`
      &:before {
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        transition: 0.3s all;
        content: '';
        width: 30px;
        height: 1px;
        background-color: ${({ theme }) => theme.selectedColor};
      }

      &:after {
        position: absolute;
        left: 155px;
        bottom: -17px;
        height: 50px;
        width: 2px;

        content: '';
        background-color: ${({ theme }) => theme.selectedColor};
      }

      color: ${({ theme }) => theme.selectedColor};
    `}

  &:hover:not(.disabled) {
    &:before {
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      transition: 0.3s all;
      content: '';
      width: 30px;
      height: 1px;
      background-color: ${({ theme }) => theme.selectedColor};
    }

    color: ${({ theme }) => theme.selectedColor};
  }
`
