import styled from 'styled-components/macro'
import { zoomIn, slideDown } from 'styles/animations'
import { MavrykTheme } from '../../../styles/interfaces'

export const TextAreaStyled = styled.div`
  position: relative;
  height: fit-content;

  .textArea-wrapper {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.backgroundColor};
    border: 1px solid ${({ theme }) => theme.strokeForForms};
    padding: 10px 30px 10px 20px;
    position: relative;
    width: 100%;

    &.disabled {
      opacity: 0.4;
    }

    &:hover:not(.disabled):not(:focus-within) {
      background-color: ${({ theme }) => theme.cards};

      .textarea {
        background-color: ${({ theme }) => theme.cards};
      }
    }

    &:focus-within {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.inputFocusColor}19;
      border-color: ${({ theme }) => theme.inputFocusColor}7F;
    }

    &.error {
      border: 1px solid ${({ theme }) => theme.downColor};
      &:focus-within {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.downColor}7F;
      }

      .textarea {
        color: ${({ theme }) => theme.downColor};
        &::placeholder {
          color: ${({ theme }) => theme.downColor};
        }
      }
    }

    &.success {
      border: 1px solid ${({ theme }) => theme.upColor};
      &:focus-within {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.upColor}7F;
      }

      .textarea {
        color: ${({ theme }) => theme.upColor};
        &::placeholder {
          color: ${({ theme }) => theme.upColor};
        }
      }
    }
  }

  .info-error {
    position: absolute;
    bottom: -20px;
    left: 0px;
    padding-right: 10px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`

export const TextAreaCounter = styled.div`
  margin-left: auto;
  color: ${({ theme }) => theme.strokeForForms};

  &.error {
    color: ${({ theme }) => theme.downColor};
  }

  &.success {
    color: ${({ theme }) => theme.upColor};
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
  stroke: ${({ theme }) => theme.strokeForForms};
`

export const TextAreaErrorMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.downColor};
  font-size: 14px;
  font-weight: 600;
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

export const TextareaStyled = styled.textarea`
  line-height: 20px;
  resize: none;
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.placeholders};
  border: unset;
  width: 100%;
  min-height: 85px;
  /* hyphens: auto; */
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 14px;
  margin: 0;
  display: block;
  overflow: visible;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &::placeholder {
    color: ${({ theme }) => theme.placeholders};
    font-weight: 400;
    font-size: 12px;
  }
`
