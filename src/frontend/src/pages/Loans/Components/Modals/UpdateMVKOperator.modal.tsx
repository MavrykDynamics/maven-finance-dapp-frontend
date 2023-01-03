import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const UpdateMVKOperator = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>UpdateMVKOperator</h2>
      </GovRightContainerTitleArea>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
