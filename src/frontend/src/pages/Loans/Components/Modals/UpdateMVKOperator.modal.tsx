import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17307%3A226700&t=Sx2aEpp3ifrGxBtQ-0
export const UpdateMVKOperator = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Update MVK Operators</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Manage permissions for depositing collateral to a selected vault. Note: these are advanced permissions and
        should be used by experts.
        <br />
        <br />- Vault Owner: Only vault owner
        <br />- Defined Accounts: Allow whitelisted addresses
        <br />- Allow Any: Any user may deposit collateral
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
