import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239234&t=Sx2aEpp3ifrGxBtQ-0
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
