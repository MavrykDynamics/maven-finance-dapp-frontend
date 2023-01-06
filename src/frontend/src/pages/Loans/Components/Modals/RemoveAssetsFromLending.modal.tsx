import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238846&t=Sx2aEpp3ifrGxBtQ-0
export const RemoveAssetsFromLending = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Withdraw Assets</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Select the amount you wish to withdraw from lending. You cannot withdraw more than you have deposited.
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
