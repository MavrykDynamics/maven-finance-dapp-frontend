import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const RemoveCollateral = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Withdraw Collateral from a Vault</h2>
      </GovRightContainerTitleArea>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
