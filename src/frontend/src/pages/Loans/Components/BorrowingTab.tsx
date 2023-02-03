import { useDispatch, useSelector } from 'react-redux'
import { useContext, useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { loansPopupsContext } from './Modals/LoansModals.provider'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'
import { getAvaliableCollaterals } from '../Actions/getLoansData.actions'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './BorrowindExpandCard'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type BorrowingTabPropsType = {
  borrowingItems: Array<LoansVaultType>
  lendingControllerAddress: string
  currentMarketAsset: string
}

export const BorrowingTab = ({
  borrowingItems,
  lendingControllerAddress,
  currentMarketAsset,
}: BorrowingTabPropsType) => {
  const dispatch = useDispatch()
  const { openCreateVaultPopup } = useContext(loansPopupsContext)
  const [createdVaultId, setCreatedVaultAddress] = useState<null | string>(null)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const { isLoading: loadingAvaliableCollaterals } = useDataLoader(async () => {
    try {
      await dispatch(getAvaliableCollaterals())
    } catch (e) {}
  }, [])

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Borrowing</h2>
      </GovRightContainerTitleArea>

      {borrowingItems.length ? (
        <>
          <Button
            text="New Vault"
            icon="plus"
            disabled={!Boolean(accountPkh)}
            onClick={() => openCreateVaultPopup({ currentMarketAsset, setCreatedVaultAddress })}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <div className="list-wrapper">
            {borrowingItems.map((item, idx) => {
              return (
                <BorrowingExpandCard
                  isOwner
                  {...item}
                  key={item.borrowedAsset.symbol + '-' + idx}
                  isOpenedVault={createdVaultId === item.address}
                  DAOFee={0}
                />
              )
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
            disabled={!Boolean(accountPkh)}
            onClick={() => openCreateVaultPopup({ currentMarketAsset, setCreatedVaultAddress })}
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
