import { Link } from 'react-router-dom'

import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

import Button from 'app/App.components/Button/NewButton'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LBHInfoBlock } from './DashboardPersonalComponents.style'

export const LendBorrowPosition = () => {
  return (
    <LBHInfoBlock>
      <GovRightContainerTitleArea>
        <h2>Lend/Borrow Position</h2>
      </GovRightContainerTitleArea>
      <div className="view-markets">
        <Link to={'/loans'}>
          <Button kind={BUTTON_PRIMARY}>View markets</Button>
        </Link>
      </div>
    </LBHInfoBlock>
  )
}
