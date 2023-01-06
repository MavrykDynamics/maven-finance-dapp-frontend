import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: add step 2 modal
export const Repay = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Repay Borrowed Funds</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">Repay the loan to withdraw your vault collateral.</div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
