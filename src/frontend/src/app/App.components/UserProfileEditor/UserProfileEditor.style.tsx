import styled from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'

export const UserProfileEditorStyled = styled.div<{ theme: MavenTheme }>`
  padding: 10px 10px 0 10px;

  .avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

export const UserProfileEditorSaveButton = styled.div`
  margin: 30px auto 0;
  max-width: 250px;
`

export const UserProfileEditorZoom = styled.div`
  color: ${({ theme }) => theme.regularText};

  & > div {
    display: flex;

    svg {
      width: 12px;
      height: 12px;

      fill: ${({ theme }) => theme.regularText};

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

    background: ${({ theme }) => theme.divider};
    background-image: ${({ theme }) => `linear-gradient(${theme.linksAndButtons}, ${theme.linksAndButtons})`};
    background-repeat: no-repeat;
    background-size: 0% 100%;
    border-radius: 5px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 17px;
      height: 17px;

      background: ${({ theme }) => theme.linksAndButtons};
      border-radius: 50%;

      cursor: ew-resize;
      transition: background 0.3s ease-in-out;
    }
  }
`

export const UserProfileEditorRotate = styled.div`
  display: flex;
  margin-top: 10px;

  button:first-of-type {
    margin-right: 10px;
  }
`
