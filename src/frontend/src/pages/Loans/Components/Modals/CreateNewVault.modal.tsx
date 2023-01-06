import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17480%3A229353&t=Sx2aEpp3ifrGxBtQ-0
export const CreateNewVault = ({ closePopup }: { closePopup: () => void }) => {
  return (
    <LoansModalBase>
      <GovRightContainerTitleArea>
        <h2>Create New Vault</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
        auctor id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum
        ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et ligula fringilla, tempus
        sapien eget, pellentesque orci. Donec finibus quam rhoncus, fringilla ex ut, feugiat nulla. Curabitur tristique
        augue non ante hendrerit ultrices
      </div>
      <button onClick={closePopup} className="close-modal" />
    </LoansModalBase>
  )
}
