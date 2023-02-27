import styled from 'styled-components/macro'
import { zoomIn, slideDown } from 'styles/animations'
import { MavrykTheme } from '../../../styles/interfaces'

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
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    margin: 0;
    color: ${({ theme }) => theme.textColor};
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
      -webkit-text-fill-color: ${({ theme }) => theme.textColor};
      -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.backgroundColor} inset;
    }

    &.search {
      color: ${({ theme }) => theme.headerColor};
    }

    &::placeholder:not(.search) {
      color: ${({ theme }) => theme.inputPlaceholder};
    }

    &::placeholder {
      color: ${({ theme }) => theme.textColor};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.containerColor};
    }

    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor}19;
      border-color: ${({ theme }) => theme.primaryColor}7F;
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
  color: ${({ theme }) => theme.textColor};
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
  stroke: ${({ theme }) => theme.backgroundTextColor};
`

export const InputErrorMessage = styled.div<{ theme: MavrykTheme }>`
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

export const InputSpacer = styled.div`
  height: 10px;
`

export const StyledInput = styled.input<{ theme: MavrykTheme }>`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 22px;
  line-height: 22px;
  margin: 0;
  color: ${({ theme }) => theme.textColor};
  display: block;
  padding: 13px 45px 13px 20px;

  &::placeholder {
    color: ${({ theme }) => theme.textColor};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.containerColor};
  }
`

export const InputPinnedChild = styled.div<{ theme: MavrykTheme }>`
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.dataColor};

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
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  width: 100%;
  height: 40px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:focus-within {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryColor}19;
    border-color: ${({ theme }) => theme.primaryColor}7F;
  }

  &.error {
    border: 1px solid ${({ theme }) => theme.downColor};
    input {
      color: ${({ theme }) => theme.downColor};
      &::placeholder {
        color: ${({ theme }) => theme.downColor};
      }
    }
  }

  &.success {
    border: 1px solid ${({ theme }) => theme.upColor};
    input {
      color: ${({ theme }) => theme.upColor};
      &::placeholder {
        color: ${({ theme }) => theme.upColor};
      }
    }
  }

  &.withdrawCollateralInput {
    margin-bottom: 45px;
  }

  &.table-input {
    border: none;
    padding: 0;
    input {
      padding: 0 10px;
      background: transparent;

      &::placeholder {
        color: ${({ theme }) => theme.dataColor};
      }
    }

    &:focus-within {
      box-shadow: unset;
      border-color: unset;
    }
  }

  &.large-input {
    height: 56px;
  }

  &.input-with-rate {
    input {
      padding-top: 0px;
      padding-bottom: 13px;
    }
  }

  &.transparent-child-wrap {
    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:hover {
      .pinned-child {
        background-color: ${({ theme }) => theme.containerColor};
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
    right: 0px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.dataColor};
  }

  .input-converted-amount {
    position: absolute;
    bottom: -2px;
    left: 25px;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${({ theme }) => theme.textColor};
  }

  .use-max-btn {
    position: absolute;
    top: -27px;
    right: 0px;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.valueColor};
  }
`

export const NewInputLabel = styled.label`
  color: ${({ theme }) => theme.textColor};
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
  top: 13px;
  right: 16px;
  z-index: 1;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.hasChild {
    right: px;
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
  color: ${({ theme }) => theme.textColor};

  svg,
  .image-wrapper {
    width: 24px;
    height: 24px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    fill: ${({ theme }) => theme.textColor};
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
  color: ${({ theme }) => theme.textColor};
`
