import styled from 'styled-components'
import { PopupContentWrapperBase } from '../PopupMain.style'

export const CouncilFormPopupsContent = styled(PopupContentWrapperBase)`
  width: 750px;
  height: 555px;

  row-gap: 5px;
  padding: 40px 30px;

  /* reseting some form styling */
  > div {
    padding: 0;
    width: 100%;
  }
`

// TODO: review
export const CouncilActionPurposePopupContent = styled(PopupContentWrapperBase)`
  padding: 30px 50px 30px 50px;

  .purpose {
    position: relative;
    margin-top: 30px;

    max-height: 460px;
    overflow: auto;

    p {
      margin: 0;
      font-weight: 600;
      font-size: 18px;
      line-height: 27px;

      color: ${({ theme }) => theme.subHeadingText};
    }

    .shadow {
      position: fixed;
      bottom: 30px;
      height: 50px;
      width: calc(100% - 105px);
      background: ${({ theme }) => `linear-gradient(to bottom, transparent 20%, ${theme.cards} 100%)`};
    }
  }
`
