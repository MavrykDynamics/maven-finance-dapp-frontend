import styled from 'styled-components'
import { PopupContentWrapperBase } from '../PopupMain.style'

export const CouncilUpdateMemberPopupContent = styled(PopupContentWrapperBase)`
  width: 100%;
  max-width: 750px;
  height: 100%;
  max-height: 555px;

  row-gap: 5px;
  padding: 40px 30px;

  /* reseting some form styling */
  > div {
    padding: 0;
    width: 100%;
  }
`

export const CouncilActionReadMorePopupContent = styled(PopupContentWrapperBase)`
  padding: 30px 50px 30px 50px;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 586px;

  .content-wrapper {
    margin-top: 30px;
    max-height: 460px;

    position: relative;
    overflow: auto;
  }

  p {
    margin: 0;
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;

    color: ${({ theme }) => theme.subHeadingText};
  }

  .contracts-list {
    display: flex;
    flex-direction: column;
    row-gap: 3px;

    /* TODO: add styling when contracts will be ready */
    .contract-item {
      display: flex;
      justify-content: space-between;

      width: 80%;

      font-weight: 600;
      font-size: 18px;
      line-height: 27px;

      color: ${({ theme }) => theme.subHeadingText};

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .shadow {
    position: fixed;
    bottom: 25px;
    height: 50px;
    width: calc(100% - 105px);
    background: ${({ theme }) => `linear-gradient(to bottom, transparent 20%, ${theme.cards} 100%)`};
    transition: 0.5s opacity;

    &.removeShadow {
      opacity: 0;
    }
  }
`
