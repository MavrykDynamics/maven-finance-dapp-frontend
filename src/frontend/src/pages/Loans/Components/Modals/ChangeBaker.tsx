import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

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
