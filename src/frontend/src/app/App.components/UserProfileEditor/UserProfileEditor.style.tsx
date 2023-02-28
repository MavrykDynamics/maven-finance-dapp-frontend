import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const UserProfileEditorStyled = styled.div<{ theme: MavrykTheme }>`
  .avatar {
    display: flex;
    justify-content: center;
  }

  .close-btn {
    position: absolute;
    right: 15px;
    top: 15px;

    width: 24px;
    height: 24px;

    fill: ${({ theme }) => theme.textColor};

    transition: opacity 0.3s;

    &:hover {
      opacity: 0.6;
    }
  }
`

export const UserProfileEditorButtons = styled.div`
  display: flex;
  justify-content: right;
  margin-top: 20px;

  button {
    padding: 0 50px;
    height: 36px;

    font-weight: 600;
    font-size: 14px;
    line-height: 20px;

    color: ${({ theme }) => theme.containerColor};
    background-color: ${({ theme }) => theme.valueColor};
    border-radius: 25px;

    transition: opacity 0.3s;

    &:hover {
      opacity: 0.6;
    }
  }
`

export const UserProfileEditorSettings = styled.div`
  margin-top: 20px;
  color: ${({ theme }) => theme.textColor};

  .setting {
    display: flex;
    align-items: center;
    margin-top: 10px;

    label {
      margin: 0;
      margin-right: 10px;
    }

    input {
      width: 100%;
    }

    button {
      padding: 0 30px;

      font-weight: 600;
      font-size: 14px;
      line-height: 20px;

      color: ${({ theme }) => theme.valueColor};
      border: 1px solid ${({ theme }) => theme.valueColor};
      border-radius: 25px;

      text-transform: capitalize;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.6;
      }

      &:first-of-type {
        margin-right: 10px;
      }
    }
  }
`
