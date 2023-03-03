import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const UserProfileEditorStyled = styled.div<{ theme: MavrykTheme }>`
  padding: 10px 10px 0 10px;

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
  margin: 30px auto 0;
  max-width: 250px;
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

  .setting-title {
    margin: 10px 0 10px 22px;
  }

  input[type='range'] {
    -webkit-appearance: none;
    width: 100%;
    height: 7px;

    background: ${({ theme }) => theme.connectInfoColor};
    background-image: ${({ theme }) => `linear-gradient(${theme.valueColor}, ${theme.valueColor})`};
    background-repeat: no-repeat;
    background-size: 0% 100%;
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
    border: 1px solid ${({ theme }) => theme.cardBorderColor};

    &:first-of-type {
      margin-right: 10px;
    }
  }
`
