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
  p {
    max-height: 460px;
    overflow-y: auto;

    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    color: ${({ theme }) => theme.subHeadingText};

    &::-webkit-scrollbar {
      position: relative;
      width: 15px;
      background-color: transparent;
      left: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-clip: padding-box;
      border-left: 5px solid rgba(0, 0, 0, 0);
      border-right: 5px solid rgba(0, 0, 0, 0);
      border-radius: 6px;
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      background-color: ${({ theme }) => theme.scrollBlockColor};
    }
  }

  .shadow {
    position: absolute;
    bottom: 25px;
    height: 50px;
    width: 85%;
    background: ${({ theme }) => `linear-gradient(to bottom, transparent 0%, ${theme.cards} 60%)`};
  }
`
