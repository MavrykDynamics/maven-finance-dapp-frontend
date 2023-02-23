import styled, { css, keyframes } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { ERROR, INFO } from './Toaster.constants'

export const ToasterStyled = styled.div<{ showing: boolean; theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  right: -470px;
  z-index: 13;
  width: 400px;
  max-width: calc(100vw - 20px);
  margin: 10px;
  padding: 21px 20px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.containerColor};
  box-shadow: 1px 7px 14px -5px rgba(0, 0, 0, 0.2);
  transform: translate3d(0px, 0, 0);
  transition: transform 1s ease-in-out;
  will-change: transform;
  overflow: hidden;

  ${(props) =>
    props.showing &&
    css`
      transform: translate3d(-470px, 0, 0);
    `}
`

export const decreaseBar = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(470px, 0, 0);
  }
`

export const ToasterCountdown = styled.div<{ showing: boolean; status?: string; theme: MavrykTheme }>`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 4px;
  width: 400px;
  max-width: calc(100vw - 20px);
  border-radius: 0 0 4px 0;
  will-change: transform;
  transform: translate3d(470px, 0, 0);
  background-color: ${(props) => {
    switch (props.status) {
      case INFO:
        return ({ theme }) => theme.infoColor
      case ERROR:
        return ({ theme }) => theme.downColor
      default:
        return ({ theme }) => theme.upColor
    }
  }};

  ${(props) =>
    props.showing &&
    css`
      animation: ${decreaseBar} ease-in-out 1;
      animation-fill-mode: forwards;
      animation-duration: 5s;
    `}
`

export const ToasterGrid = styled.div`
  display: flex;
  column-gap: 15px;
`

export const ToasterIcon = styled.div<{ status?: string; theme: MavrykTheme }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-top: 13px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  > svg {
    height: 14px;
    width: 14px;
    fill: ${(props) => {
      switch (props.status) {
        case INFO:
          return ({ theme }) => theme.infoColor
        case ERROR:
          return ({ theme }) => theme.downColor
        default:
          return ({ theme }) => theme.upColor
      }
    }};
  }
`

export const ToasterContent = styled.div`
  padding: 8px;
  max-width: 300px;
  width: 100%;

  > div {
    word-break: break-word;
  }
`

export const ToasterTitle = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.textColor};
  font-weight: 700;
  margin-bottom: 8px;
`

export const ToasterMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.subTextColor};
`

export const ToasterClose = styled.div<{ theme: MavrykTheme }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  margin-top: 13px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  > svg {
    fill: ${({ theme }) => theme.textColor};
    height: 14px;
    width: 14px;
  }
`
