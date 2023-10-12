import styled from 'styled-components/macro'

export const CheckboxStyled = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  width: fit-content;
  column-gap: 10px;

  .checkbox-text {
    font-weight: 500;
    font-size: 14px;
    color: ${({ theme }) => theme.mainHeadingText};
    transition: 0.15s ease-in-out;
  }

  label#checkbox-icon {
    padding: 0;
    margin: 0;

    width: 24px;
    height: 24px;

    transition: 0.15s ease-in-out;
    border: 1px solid ${({ theme }) => theme.strokeColor};
    border-radius: 5px;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${({ theme }) => theme.backgroundColor};

    &.isLabelTextHovered {
      background-color: ${({ theme }) => theme.cards};
    }

    svg {
      width: 13px;
      height: 13px;
      opacity: 0;
      transition: 0.15s ease-in-out;
      fill: ${({ theme }) => theme.backgroundColor};
    }
  }

  input {
    appearance: none;
    visibility: hidden;
    position: absolute;
    z-index: -1;

    &:checked {
      & + label#checkbox-icon {
        background-color: ${({ theme }) => theme.selectedColorSecondary};

        svg {
          opacity: 1;
        }
      }
    }
  }

  /* add hovers only if checkbox is active */
  &:not(.disabled) {
    input:not(:checked) {
      & + label#checkbox-icon:hover {
        background-color: ${({ theme }) => theme.cards};

        & + .checkbox-text {
          opacity: 0.8;
        }
      }
    }

    input:checked {
      & + label#checkbox-icon:hover {
        & + .checkbox-text {
          opacity: 0.8;
        }
      }
    }

    .checkbox-text:hover {
      opacity: 0.8;
    }
  }

  * {
    cursor: pointer;
  }

  &.disabled {
    opacity: 0.6;

    * {
      cursor: not-allowed;
    }
  }
`
