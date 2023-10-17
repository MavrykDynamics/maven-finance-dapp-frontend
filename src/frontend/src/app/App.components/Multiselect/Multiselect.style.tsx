import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const MultiselectStyled = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  position: relative;

  &.disabled {
    cursor: not-allowed;

    > div {
      pointer-events: none;
    }
  }
`

export const MultiselectOptionsControlStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  cursor: pointer;

  width: 100%;
  min-height: 35px;
  padding: 16px;
  column-gap: 10px;

  display: flex;
  align-items: center;

  background-color: ${({ theme }) => theme.cards};
  border: 1px solid ${({ theme }) => theme.strokeColor};

  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;

  &:before {
    content: '';
    background-color: ${({ theme }) => theme.divider};
    position: absolute;
    height: 1px;
    width: calc(100% - 16px);
    left: 50%;
    transform: translateX(-50%);
    bottom: 8px;
  }

  // TODO: while input recreating move this styling for search input and use custom input in Multiselect
  input {
    background-color: transparent;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    border: none;
    outline: none;

    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    color: ${({ theme }) => theme.primaryText};

    &::placeholder {
      font-size: 14px;
      font-weight: 500;
      line-height: 24px;
      color: ${({ theme }) => theme.placeholders};
    }

    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
      cursor: pointer;

      display: inline-block;

      width: 11px;
      height: 11px;
      margin-left: 10px;

      background: ${({ theme }) => `linear-gradient(
          45deg,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0) 43%,
          ${theme.divider} 47%,
          ${theme.divider} 53%,
          rgba(0, 0, 0, 0) 57%,
          rgba(0, 0, 0, 0) 100%
        ),
        linear-gradient(135deg, transparent 0%, transparent 43%, ${theme.divider} 47%, ${theme.divider} 53%, transparent 57%, transparent 100%)`};

      &:hover {
        background: ${({ theme }) => `linear-gradient(
          45deg,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0) 43%,
          ${theme.linksAndButtons} 47%,
          ${theme.linksAndButtons} 53%,
          rgba(0, 0, 0, 0) 57%,
          rgba(0, 0, 0, 0) 100%
        ),
        linear-gradient(135deg, transparent 0%, transparent 43%, ${theme.linksAndButtons} 47%, ${theme.linksAndButtons} 53%, transparent 57%, transparent 100%)`};
      }
    }
  }

  svg {
    transition: 0.3s fill;
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.strokeForForms};
  }

  &:focus-within {
    svg {
      fill: ${({ theme }) => theme.linksAndButtons};
    }
  }
`

export const MultiselectMenuOptionStyled = styled.div<{ theme: MavrykTheme }>`
  cursor: pointer;
  width: 100%;
  column-gap: 10px;
  padding: 6px 16px 6px 8px;

  display: flex;
  align-items: center;

  .option-text {
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;

    color: ${({ theme }) => theme.placeholders};
  }

  .checkbox {
    z-index: -1;
  }

  .img-wrapper,
  .img-plug {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    fill: ${({ theme }) => theme.regularText};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  &:hover {
    #checkbox-label {
      background-color: ${({ theme }) => theme.cards};
    }
  }
`

export const MultiselectHeaderOptionStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  background-color: ${({ theme }) => theme.selectedColor};

  padding: 0 10px;
  column-gap: 10px;
  border-radius: 8px;

  cursor: pointer;
  transition: 0.3s opacity;

  &:hover {
    opacity: 0.8;
  }

  .option-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;

    color: ${({ theme }) => theme.backgroundColor};
  }

  .unselect-option {
    display: flex;
    align-items: center;

    svg {
      fill: ${({ theme }) => theme.backgroundColor};
      width: 12px;
      height: 12px;
    }
  }
`

export const MultiselectHeaderStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;

  padding: 8px 16px;
  min-height: 40px;

  background-color: ${({ theme }) => theme.backgroundColor};
  border: 1px solid ${({ theme }) => theme.strokeColor};
  border-radius: 10px;

  cursor: pointer;
  position: relative;
  z-index: 4;

  &.isOpen {
    border: 1px solid ${({ theme }) => theme.linksAndButtons};
  }

  &:before {
    content: '';
    height: calc(100% - 2px);
    width: 1px;
    background-color: ${({ theme }) => theme.divider};
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 46px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.cards};
  }

  .selected-options-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .loader {
    display: flex;
    align-items: center;

    column-gap: 10px;

    color: ${({ theme }) => theme.placeholders};

    /* changed color of loader to match text color */
    div {
      color: ${({ theme }) => theme.placeholders};
    }
  }

  .placeholder {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.placeholders};
  }

  .controls {
    margin-left: auto;
    height: 100%;
    width: fit-content;

    display: flex;
    align-items: center;

    .open-status {
      display: flex;
      align-items: center;

      padding-left: 12px;
      margin-left: 10px;

      svg {
        transition: 0.3s rotate;
        width: 18px;
        height: 17px;
      }

      &.isOpen {
        svg {
          rotate: 180deg;
        }
      }
    }

    .clear-all {
      display: flex;
      align-items: center;

      svg {
        transition: 0.3s fill;
        width: 12px;
        height: 12px;
      }

      &:hover {
        svg {
          fill: ${({ theme }) => theme.linksAndButtons};
        }
      }
    }

    svg {
      fill: ${({ theme }) => theme.strokeForForms};
    }
  }
`

export const MultiselectMenuStyled = styled.div<{ theme: MavrykTheme }>`
  .space {
    width: 100%;
    height: 5px;
  }

  width: 100%;

  position: absolute;
  top: 100%;
  z-index: 2;
`

export const MultiselectBackdropStyled = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  z-index: 1;

  bottom: 0;
  left: 0;
  top: 0;
  right: 0;
`
