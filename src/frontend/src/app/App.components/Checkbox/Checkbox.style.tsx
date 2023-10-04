import styled from 'styled-components/macro'

export const CheckboxStyled = styled.div`
  position: relative;
  display: flex;
  column-gap: 10px;
  align-items: center;

  .children {
    color: ${({ theme }) => theme.regularText};
    font-weight: 600;
    font-size: 14px;
  }

  label#checkbox-label {
    padding: 0;
    margin: 0;
    width: 24px;
    height: 24px;
    border: 1px solid ${({ theme }) => theme.strokeColor};
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.15s ease-in-out;
    cursor: pointer;
    background-color: ${({ theme }) => theme.backgroundColor};

    &:hover {
      background-color: ${({ theme }) => theme.cards};
    }
  }

  svg {
    fill: ${({ theme }) => theme.backgroundColor};
    width: 13px;
    height: 13px;
    opacity: 0;
    transition: 0.15s ease-in-out;
  }

  input {
    appearance: none;
    visibility: hidden;
    position: absolute;
    z-index: -1;

    &:checked {
      & + label#checkbox-label {
        background-color: ${({ theme }) => theme.selectedColorSecondary};
        svg {
          opacity: 1;
        }

        &:hover {
          background-color: ${({ theme }) => theme.selectedColorSecondary};
        }
      }
    }
  }

  &.disabled {
    * {
      cursor: not-allowed;
    }
  }
`
