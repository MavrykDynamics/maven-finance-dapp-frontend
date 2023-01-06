import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

export const AddMoreAssetsAsCollateral = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Add More Assets As Collateral</h2>
      </GovRightContainerTitleArea>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
