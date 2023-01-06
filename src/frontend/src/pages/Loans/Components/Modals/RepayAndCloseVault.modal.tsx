import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17953%3A224221&t=Sx2aEpp3ifrGxBtQ-0
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
