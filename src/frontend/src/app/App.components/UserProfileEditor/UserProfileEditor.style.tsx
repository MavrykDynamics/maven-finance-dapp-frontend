import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const UserProfileEditorStyled = styled.div<{ theme: MavrykTheme }>`
  padding: 10px 25px 0 25px;

  .avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .close-btn {
    position: absolute;
    right: 15px;
    top: 15px;

    width: 24px;
    height: 24px;

    fill: ${({ theme }) => theme.valueColor};

    transition: opacity 0.3s;

    &:hover {
      opacity: 0.6;
    }
  }
`

export const UserProfileEditorSaveButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;

  button {
    padding: 0 50px;
    height: 50px;
    width: 250px;

    font-weight: 600;
    font-size: 16px;
    line-height: 16px;

    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.valueColor};
    border-radius: 25px;

    transition: opacity 0.3s;

    &:hover {
      opacity: 0.6;
    }
  }
`

export const UserProfileEditorZoom = styled.div`
  color: ${({ theme }) => theme.textColor};

  & > div {
    display: flex;

    svg {
      width: 12px;
      height: 12px;

      fill: ${({ theme }) => theme.textColor};

      &:first-of-type {
        margin-right: 10px;
      }

      &:last-of-type {
        margin-left: 10px;
      }
    }
  }

  label {
    margin: 10px 0 10px 22px;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 7px;

    background: ${({ theme }) => theme.connectInfoColor};
    background-image: ${({ theme }) => `linear-gradient(${theme.valueColor}, ${theme.valueColor})`};
    background-repeat: no-repeat;
    border-radius: 5px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 17px;
      height: 17px;

      background: ${({ theme }) => theme.valueColor};
      border-radius: 50%;

      cursor: ew-resize;
      transition: background 0.3s ease-in-out;
    }
  }
`

export const UserProfileEditorRotate = styled.div`
  display: flex;
  margin-top: 10px;

  button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 30px;
    height: 30px;

    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 50%;

    transition: opacity 0.3s;

    svg {
      width: 16px;
      height: 16px;
      fill: ${({ theme }) => theme.valueColor};
    }

    &:hover {
      opacity: 0.6;
    }

    &:first-of-type {
      margin-right: 10px;
    }
  }
`
