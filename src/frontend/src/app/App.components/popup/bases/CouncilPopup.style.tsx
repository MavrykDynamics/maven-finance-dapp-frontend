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
