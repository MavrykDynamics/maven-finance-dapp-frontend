import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const RepayAndCloseVault = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Repay in Full & Close Vault</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Fully repay the loan and close your vault. Your collateral will automatically be withdrawn to your wallet.
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
