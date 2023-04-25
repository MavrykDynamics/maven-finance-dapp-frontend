import styled, { css } from 'styled-components/macro'
import { decreaseBar } from 'styles/animations'
import { MavrykTheme } from '../../../styles/interfaces'
import { TOASTER_LOADING, getColorByToasterStatus } from './Toaster.constants'

export const ToasterStyled = styled.div<{ showing: boolean; theme: MavrykTheme }>`
  position: fixed;
  top: 10px;
  right: -500px;
  z-index: 13;

  width: 500px;
  padding: 0 20px;
  border-radius: 4px;

  display: flex;
  align-items: center;
  column-gap: 15px;
  min-height: 90px;

  background-color: ${({ theme }) => theme.containerColor};
  box-shadow: 1px 7px 14px -5px rgba(0, 0, 0, 0.2);

  transition: transform 1s ease-in-out;
  overflow: hidden;

  ${(props) =>
    props.showing &&
    css`
      transform: translateX(-510px);
    `}
`

export const ToasterCountdown = styled.div<{ showing: boolean; status?: string; theme: MavrykTheme }>`
  position: absolute;
  bottom: 0;
  right: 0;

  height: 4px;
  width: 100%;
  border-radius: 0 0 4px 0;

  background-color: ${({ status, theme }) => getColorByToasterStatus({ toasterStatus: status, theme })};

  ${(props) =>
    props.showing &&
    props.status !== TOASTER_LOADING &&
    css`
      animation: ${decreaseBar} ease-in-out 1;
      animation-fill-mode: forwards;
      animation-duration: 5s;
    `}
`

export const ToasterIcon = styled.div<{ status?: string; theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  width: 40px;
  height: 40px;

  .toaster-loader {
    transform: scale(0.175);
    color: ${({ theme }) => theme.primaryColor};
  }

  > svg {
    height: 16px;
    width: 16px;
    fill: ${({ status, theme }) => getColorByToasterStatus({ toasterStatus: status, theme })};
  }
`

export const ToasterContent = styled.div<{ status?: string; theme: MavrykTheme }>`
  padding: 8px;
  max-width: 300px;
  width: 100%;

  div {
    word-break: break-word;
  }

  .title {
    color: ${({ status, theme }) => getColorByToasterStatus({ toasterStatus: status, theme })};
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 8px;
  }

  .message {
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
  }
`
