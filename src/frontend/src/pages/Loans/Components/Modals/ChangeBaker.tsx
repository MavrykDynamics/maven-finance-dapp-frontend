import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238629&t=Sx2aEpp3ifrGxBtQ-0
export const ChangeBaker = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Change Baker</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">Please choose the Bakery to delegate your XTZ.</div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
