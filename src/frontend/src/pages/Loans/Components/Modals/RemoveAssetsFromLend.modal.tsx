import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const RemoveAssetsFromLend = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Withdraw Assets</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Select the amount you wish to withdraw from lending. You cannot withdraw more than you have deposited.
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
