import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239981&t=Sx2aEpp3ifrGxBtQ-0
export const AddLendingAsset = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Supplying Assets to Lending</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Earn yield by depositing assets to Mavryk’s lending pools. Loans are secured by 200% collateral. Supplied XTZ is
        automatically delegated to the Mavryk Finance DAO Bakery.
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
