import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const AddNewCollateral = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Add More Assets As Collateral</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">Select an assets to add as collateral to an existing vault.</div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
