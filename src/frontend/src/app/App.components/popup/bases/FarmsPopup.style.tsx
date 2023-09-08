import styled from 'styled-components'
import { PopupContentWrapperBase } from '../PopupMain.style'

export const FarmActionsPopupsContent = styled(PopupContentWrapperBase)`
  height: 360px;
  width: 480px;

  row-gap: 5px;
  padding: 40px 35px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  .popup-header {
    display: flex;
    align-items: center;
    column-gap: 20px;

    width: 100%;

    > div {
      max-width: 70%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  .action-btn {
    width: 250px;
  }
`
