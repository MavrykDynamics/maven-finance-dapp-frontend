import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239633&t=Sx2aEpp3ifrGxBtQ-0
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
