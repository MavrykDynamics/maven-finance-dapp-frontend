import styled, { keyframes } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const TextAreaStyled = styled.div`
  position: relative;

  .textArea-wrapper {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.backgroundColor};
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    padding: 10px 20px;
    position: relative;
    width: 100%;

    &.disabled {
      opacity: 0.4;
    }

    &:hover:not(.disabled):not(:focus-within) {
      background-color: ${({ theme }) => theme.containerColor};

      .textarea {
        background-color: ${({ theme }) => theme.containerColor};
      }
    }

    &:focus-within {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor}19;
      border-color: ${({ theme }) => theme.primaryColor}7F;
    }

    &.error {
      border: 1px solid ${({ theme }) => theme.downColor};
      &:focus-within {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.downColor}7F;
      }

      .textarea {
        color: ${({ theme }) => theme.downColor};
      }
    }

    &.success {
      border: 1px solid ${({ theme }) => theme.upColor};
      &:focus-within {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.upColor}7F;
      }

      .textarea {
        color: ${({ theme }) => theme.upColor};
      }
    }
  }

  .textarea {
    resize: none;
    background-color: ${({ theme }) => theme.backgroundColor};
    color: ${({ theme }) => theme.headerColor};
    border: unset;
    width: 100%;
    hyphens: auto;
    font-family: 'Metropolis', Helvetica, Arial, sans-serif;
    font-weight: 500;
    margin: 0;
    display: block;
    overflow: visible;
    transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

    &::placeholder {
      color: ${({ theme }) => theme.inputPlaceholder};
    }
  }
`

export const TextAreaCounter = styled.div`
  position: absolute;
  bottom: -20px;
  right: 10px;

  &.error {
    color: ${({ theme }) => theme.downColor};
  }

  &.success {
    color: ${({ theme }) => theme.upColor};
  }
`

const zoomIn = keyframes`
  from {
    transform:scale(.2);
    opacity:0
  }
  to {
    transform:scale(1);
    opacity:1
  }
`

export const TextAreaStatus = styled.div`
  display: block;
  position: absolute;
  top: 25px;
  right: 10px;
  z-index: 1;
  margin-top: -10px;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.error {
    background-image: url('/icons/input-error.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 15px;
    width: 15px;
  }

  &.success {
    background-image: url('/icons/input-success.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 12px;
    width: 17px;
  }
`

export const TextAreaIcon = styled.svg<{ theme: MavrykTheme }>`
  display: block;
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  stroke: ${({ theme }) => theme.backgroundTextColor};
`

const slideDown = keyframes`
  from {
    transform: translate3d(0, -10px, 0);
    opacity:0
  }
  to {
    transform: translate3d(0, 0px, 0);
    opacity:1
  }
`

export const TextAreaErrorMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.downColor};
  line-height: 24px;
  will-change: transform, opacity;
  animation: ${slideDown} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-letter {
    text-transform: uppercase;
  }
`

export const TextAreaSpacer = styled.div`
  height: 10px;
`
