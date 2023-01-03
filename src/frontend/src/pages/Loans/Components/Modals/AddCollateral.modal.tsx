import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const AddCollateral = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Add Collateral To A Vault</h2>
      </GovRightContainerTitleArea>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
