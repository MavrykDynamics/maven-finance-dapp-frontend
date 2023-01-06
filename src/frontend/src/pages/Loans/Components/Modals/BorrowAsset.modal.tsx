import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A240058&t=Sx2aEpp3ifrGxBtQ-0
export const BorrowAsset = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Borrow Asset</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
