import styled, { css } from 'styled-components/macro'
import { zoomIn, slideDown } from 'styles/animations'
import { MavrykTheme } from '../../../styles/interfaces'
import {
  INPUT_BIG,
  INPUT_LARGE,
  INPUT_MEDIUM,
  INPUT_SMALL,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from './Input.constants'

export const InputStyled = styled.div`
  position: relative;
  width: 100%;
`

export const InputComponentContainer = styled.div<{ theme: MavrykTheme }>`
  display: block;
  position: relative;

  input {
    width: 100%;
    height: 40px;
    background-color: ${({ theme }) => theme.backgroundColor};
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    border: 1px solid ${({ theme }) => theme.strokeForForms};
    margin: 0;
    color: ${({ theme }) => theme.placeholders};
    -webkit-appearance: none;
    appearance: none;
    display: block;
    position: relative;
    padding: 13px 45px 13px 20px;
    border-radius: 10px;
    transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    will-change: border-color, box-shadow;

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: ${({ theme }) => theme.placeholders};
      -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.backgroundColor} inset;
    }

    &.search {
      color: ${({ theme }) => theme.placeholders};
    }

    &::placeholder:not(.search) {
      color: ${({ theme }) => theme.placeholders};
    }

    &::placeholder {
      color: ${({ theme }) => theme.placeholders};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.cards};
    }

    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.inputFocusColor}19;
      border-color: ${({ theme }) => theme.inputFocusColor}7F;
    }

    &.error {
      border: 1px solid ${({ theme }) => theme.downColor};
      color: ${({ theme }) => theme.downColor};

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus {
        -webkit-text-fill-color: ${({ theme }) => theme.downColor};
        -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.backgroundColor} inset;
      }
      &:focus {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.downColor}7F;
      }
    }

    &.success {
      border: 1px solid ${({ theme }) => theme.upColor};
      color: ${({ theme }) => theme.upColor};

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus {
        -webkit-text-fill-color: ${({ theme }) => theme.upColor};
        -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.backgroundColor} inset;
      }
      &:focus {
        box-shadow: 0 0 0 2px ${({ theme }) => theme.upColor}7F;
      }
    }
  }
`

export const InputLabel = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  right: 16px;
  top: 18px;
  color: ${({ theme }) => theme.placeholders};
  font-size: 18px;
  font-weight: 600;

  &.error {
    color: ${({ theme }) => theme.downColor};
  }

  &.success {
    color: ${({ theme }) => theme.upColor};
  }
`

export const InputStatus = styled.div`
  display: block;
  position: absolute;
  top: 13px;
  right: 16px;
  z-index: 1;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.with-text {
    right: 66px;
  }

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

export const InputIcon = styled.svg<{ theme: MavrykTheme }>`
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
  stroke: ${({ theme }) => theme.placeholders};
`

export const InputErrorMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.downColor};
  line-height: 12px;
  font-size: 12px;
  font-weight: 400;
  will-change: transform, opacity;
  animation: ${slideDown} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  position: absolute;
  left: 0;
  bottom: -16px;

  &:first-letter {
    text-transform: uppercase;
  }
`

export const InputSpacer = styled.div`
  height: 10px;
`

// New input styles
// TODO: refactor colors with theme implementation
export const StyledInput = styled.input<{ theme: MavrykTheme }>`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  border: none;
  border-radius: 10px;
  line-height: 100%;
  margin: 0;
  color: ${({ theme }) => theme.placeholders};
  display: block;
  padding: 13px 45px 13px 20px;

  &::placeholder {
    color: ${({ theme }) => theme.placeholders};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.cards};
  }

  &.remove-right-border-radius {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &.${INPUT_STATUS_SUCCESS}, &.${INPUT_STATUS_ERROR} {
    padding-right: 35px;
  }
`

export const InputPinnedChild = styled.div<{ theme: MavrykTheme }>`
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.strokeColor};
  background-color: ${({ theme }) => theme.backgroundColor};
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;

  .img-wrapper,
  svg {
    width: 30px;
    height: 30px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`

export const InputWrapper = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  display: flex;
  border: 1px solid ${({ theme }) => theme.strokeForForms};
  border-radius: 10px;
  width: 100%;
  height: 40px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &.${INPUT_MEDIUM} {
    height: 50px;

    input {
      font-weight: 500;
      font-size: 14px;
    }

    input::placeholder {
      font-weight: 400;
      font-size: 12px;
    }
  }

  &.${INPUT_LARGE} {
    height: 56px;

    input {
      font-weight: 600;
      font-size: 22px;
    }

    input::placeholder {
      font-weight: 400;
      font-size: 16px;
    }
  }

  &.${INPUT_BIG} {
    height: 60px;

    input {
      font-weight: 600;
      font-size: 22px;
    }

    input::placeholder {
      font-weight: 400;
      font-size: 16px;
    }
  }

  &.${INPUT_SMALL} {
    height: 40px;

    input {
      font-weight: 500;
      font-size: 14px;
    }

    input::placeholder {
      font-weight: 400;
      font-size: 12px;
    }
  }

  &:focus-within {
    box-shadow: 0 0 0 1.5px ${({ theme }) => theme.inputFocusColor}19;
    border-color: ${({ theme }) => theme.inputFocusColor}7F;
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.${INPUT_STATUS_ERROR} {
    border: 1px solid ${({ theme }) => theme.downColor};
    input {
      color: ${({ theme }) => theme.downColor};

      &::placeholder {
        color: ${({ theme }) => theme.downColor};
      }
    }

    .pinned-child {
      border-left: 1px solid ${({ theme }) => theme.downColor};
    }

    &:focus-within {
      box-shadow: 0 0 0 1.5px ${({ theme }) => theme.downColor}7F;
    }
  }

  &.${INPUT_STATUS_SUCCESS} {
    border: 1px solid ${({ theme }) => theme.upColor};
    input {
      color: ${({ theme }) => theme.upColor};

      &::placeholder {
        color: ${({ theme }) => theme.upColor};
      }
    }

    .pinned-child {
      border-left: 1px solid ${({ theme }) => theme.upColor};
    }

    &:focus-within {
      box-shadow: 0 0 0 1.5px ${({ theme }) => theme.upColor}7F;
    }
  }

  &.mb-45 {
    margin-bottom: 45px;
  }

  &.table-input {
    border: none;
    padding: 0;
    input {
      padding: 0 10px;
      background: transparent;
    }

    &:focus-within {
      box-shadow: unset;
      border-color: unset;
    }
  }

  &.input-with-rate {
    input {
      padding-top: 0px;
      padding-bottom: 10px;
    }
  }

  &.transparent-child-wrap {
    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:has(input:hover) {
      .pinned-child {
        background-color: ${({ theme }) => theme.cards};
      }
    }

    .pinned-child {
      border-left: none;
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
      background-color: ${({ theme }) => theme.backgroundColor};
    }
  }

  .input-balance {
    position: absolute;
    bottom: -35px;
    right: 15px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.primaryText};
  }

  .input-converted-amount {
    position: absolute;
    bottom: -2px;
    left: 25px;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${({ theme }) => theme.placeholders};
  }

  .useMax-btn {
    position: absolute;
    top: -20px;
    right: 15px;
    font-size: 14px;

    &::before {
      position: absolute;
      background-color: ${({ theme }) => theme.linksAndButtons};
      width: 100%;
      content: '';
      height: 1px;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .pointer {
    cursor: pointer;
  }
`

export const NewInputLabel = styled.label`
  color: ${({ theme }) => theme.mainHeadingText};
  display: block;
  white-space: nowrap;
  font-weight: 700;
  font-size: 14px;
  position: absolute;
  top: -20px;
  left: 12px;
`

export const InputStyledStatus = styled.div<{ theme: MavrykTheme }>`
  display: block;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 13px;
  z-index: 1;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.${INPUT_STATUS_ERROR} {
    background-image: url('/icons/input-error.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 15px;
    width: 15px;
  }

  &.${INPUT_STATUS_SUCCESS} {
    background-image: url('/icons/input-success.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 12px;
    width: 17px;
  }
`

export const InputPinnedTokenInfo = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  column-gap: 10px;
  min-width: max-content;
  align-items: center;
  padding: 0 15px;
  height: 100%;
  font-weight: 600;
  font-size: 20px;
  line-height: 20px;
  color: ${({ theme }) => theme.subHeadingText};

  svg,
  .image-wrapper {
    width: 24px;
    height: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    fill: ${({ theme }) => theme.subHeadingText};
  }
`

export const InputPinnedDropDown = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  min-width: max-content;
  align-items: center;
  padding: 0 7px;
  height: 100%;
  font-weight: 600;
  font-size: 20px;
  line-height: 20px;
  color: ${({ theme }) => theme.placeholders};
`
