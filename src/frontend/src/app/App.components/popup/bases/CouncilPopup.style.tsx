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

  .contracts-grid {
    display: grid;
    grid-template-columns: max-content auto;
    grid-template-rows: auto;
    row-gap: 3px;

    font-weight: 600;
    font-size: 16px;
    line-height: 24px;

    color: ${({ theme }) => theme.subHeadingText};

    .contract-name {
      margin-left: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .shadow {
    position: fixed;
    bottom: 25px;
    height: 50px;
    width: calc(100% - 105px);
    background: ${({ theme }) => `linear-gradient(to bottom, transparent 20%, ${theme.cards} 100%)`};
    transition: 0.5s opacity;
    visibility: visible;

    &.removeShadow {
      opacity: 0;
      visibility: hidden;
    }
  }
`
