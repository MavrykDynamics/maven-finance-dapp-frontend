import styled, { css } from 'styled-components'
import { decreaseBar } from 'styles/animations'
import { MavenTheme } from '../../../styles/interfaces'
import { TOASTER_LOADING, TOASTER_REVEAL, getColorByToasterStatus } from '../toaster.provider.const'
import { ToasterAnimationType, ToasterTypes } from '../toaster.provider.type'
// animations
import { revealFromRight, hideToRight } from 'styles/animations'

export const ToasterContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  z-index: 200; /* to show toasts on the front side when modal is opened*/
  width: 500px;
  background: transparent;
`

export const ToasterStyled = styled.div<{
  theme: MavenTheme
  $distance: number
  $delay: number
  $animationType: ToasterAnimationType
}>`
  width: 100%;
  position: relative;
  padding: 0 20px;
  border-radius: 4px;

  display: flex;
  align-items: center;
  column-gap: 15px;
  min-height: 90px;

  background-color: ${({ theme }) => theme.cards};
  box-shadow: 1px 7px 14px -5px rgba(0, 0, 0, 0.2);

  transition: transform 1s ease-in-out;
  overflow: hidden;

  animation-name: ${({ $distance, $animationType }) =>
    $animationType === TOASTER_REVEAL ? revealFromRight($distance) : hideToRight($distance)};
  animation-duration: ${({ $delay }) => `${$delay}ms`};
  animation-timing-function: ease-in-out;
`

export const ToasterCountdown = styled.div<{ $status?: ToasterTypes; theme: MavenTheme }>`
  position: absolute;
  bottom: 0;
  right: 0;

  height: 4px;
  width: 100%;
  border-radius: 0 0 4px 0;

  background-color: ${({ $status, theme }) => getColorByToasterStatus({ toasterStatus: $status, theme })};

  ${({ $status }) =>
    $status !== TOASTER_LOADING &&
    css`
      animation: ${decreaseBar} ease-in-out 1;
      animation-fill-mode: forwards;
      animation-duration: 5s;
    `}
`

export const ToasterIcon = styled.div<{ $status?: ToasterTypes; theme: MavenTheme }>`
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
    fill: ${({ $status, theme }) => getColorByToasterStatus({ toasterStatus: $status, theme })};
  }
`

export const ToasterContent = styled.div<{ $status?: ToasterTypes; theme: MavenTheme }>`
  padding: 8px;
  max-width: calc(100% - 60px);
  width: 100%;

  div {
    word-break: break-word;
  }

  .title {
    color: ${({ $status, theme }) => getColorByToasterStatus({ toasterStatus: $status, theme })};
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 8px;
  }

  .message {
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.textColor};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`
