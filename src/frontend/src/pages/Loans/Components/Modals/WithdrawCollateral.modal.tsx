import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const WithdrawCollateral = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Withdraw Collateral from a Vault</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">Select one or multiple assets to remove as collateral from the vault.</div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
