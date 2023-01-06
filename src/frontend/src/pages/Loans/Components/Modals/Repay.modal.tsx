import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17953%3A224110&t=Sx2aEpp3ifrGxBtQ-0
export const Repay = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Repay Borrowed Funds</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">Repay the loan to withdraw your vault collateral.</div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
