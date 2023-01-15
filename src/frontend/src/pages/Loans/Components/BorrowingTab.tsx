import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'
import { CreateNewVault } from './Modals/CreateNewVault.modal'

type BorrowingTabPropsType = {
  borrowingItems: Array<BorrowingData>
  lendingControllerAddress: string
}

export const BorrowingTab = ({ borrowingItems, lendingControllerAddress }: BorrowingTabPropsType) => {
  const [showCreateVaultModal, setCreateVaultModal] = useState(false)
  const dispatch = useDispatch()

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Boorrowing</h2>
      </GovRightContainerTitleArea>

      <CreateNewVault closePopup={() => setCreateVaultModal(false)} show={showCreateVaultModal} />

      {borrowingItems.length ? (
        <>
          <Button
            text="New Vault"
            icon="plus"
            onClick={() => setCreateVaultModal(true)}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <div className="list-wrapper">
            {borrowingItems.map((item, idx) => {
              return <BorrowingExpandCard isOwner {...item} key={item.borrowedAsset.assetSymbol + '-' + idx} />
            })}
          </div>
        </>
      ) : (
        <NoItemsInTabStyled>
          <span>To borrow, you must first create a vault and add collateral.</span>
          <Button
            text="New Vault"
            icon="plus"
            kind={ACTION_PRIMARY}
            onClick={() => setCreateVaultModal(true)}
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}
