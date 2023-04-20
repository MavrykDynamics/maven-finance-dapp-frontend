import styled, { css } from 'styled-components/macro'
import { decreaseBar } from 'styles/animations'
import { MavrykTheme } from '../../../styles/interfaces'
import { ERROR, INFO, TOASTER_ERROR, TOASTER_INFO, TOASTER_LOADING, TOASTER_SUCCESS } from './Toaster.constants'

export const ToasterStyled = styled.div<{ showing: boolean; theme: MavrykTheme }>`
  position: fixed;
  top: 10px;
  right: -470px;
  z-index: 13;

  width: 470px;
  padding: 21px 20px;
  border-radius: 4px;

  display: flex;
  column-gap: 15px;

  background-color: ${({ theme }) => theme.containerColor};
  box-shadow: 1px 7px 14px -5px rgba(0, 0, 0, 0.2);

  transition: transform 1s ease-in-out;
  overflow: hidden;

  ${(props) =>
    props.showing &&
    css`
      transform: translateX(-480px);
    `}

  .close {
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

export const ToasterIcon = styled.div<{ status?: string; theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: space-around;

  > svg {
    height: 14px;
    width: 14px;
    fill: ${(props) => {
      switch (props.status) {
        case TOASTER_SUCCESS:
          return ({ theme }) => theme.infoColor
        case TOASTER_ERROR:
          return ({ theme }) => theme.downColor
        case TOASTER_INFO:
          return ({ theme }) => theme.downColor
        default:
          return ({ theme }) => theme.downColor
        // case TOASTER_LOADING:
        //   return ({ theme }) => theme.downColor
      }
    }};
  }
`

export const ToasterContent = styled.div`
  padding: 8px;
  max-width: 300px;
  width: 100%;

  div {
    word-break: break-word;
  }

  .title {
    color: ${({ theme }) => theme.textColor};
    font-weight: 700;
    margin-bottom: 8px;
  }

  .message {
    color: ${({ theme }) => theme.subTextColor};
  }
`
