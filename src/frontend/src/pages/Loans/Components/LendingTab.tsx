import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { ThreeLevelListItem } from '../Loans.style'
import { LendingTabListItem, LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LendingItemType, LoanTokenType } from 'utils/TypesAndInterfaces/Loans'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { useState } from 'react'
import { AddLendingAsset } from './Modals/AddLendingAsset.modal'
import { RemoveAssetsFromLending } from './Modals/RemoveAssetsFromLending.modal'
import { AddLendingAssetDataType, RemoveLendingAssetDataType } from './Modals/Modals.helpers'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanTokenType['loanTokenData']
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData }: LendingTabPropsType) => {
  const [showAddModal, setAddModal] = useState(false)
  const [showRemoveModal, setRemoveModal] = useState(false)
  const [addLendingAssetModalData, setAddLendingAssetModalData] = useState<undefined | AddLendingAssetDataType>()
  const [removeLendingAssetModalData, setRemoveLendingAssetModalData] = useState<
    undefined | RemoveLendingAssetDataType
  >()

  return (
    <LoansTabStyled>
      <AddLendingAsset
        closePopup={() => setAddModal(false)}
        show={Boolean(showAddModal && addLendingAssetModalData)}
        modalData={addLendingAssetModalData}
      />

      <RemoveAssetsFromLending
        closePopup={() => setRemoveModal(false)}
        show={showRemoveModal}
        data={removeLendingAssetModalData}
      />

      <GovRightContainerTitleArea>
        <h2>My Lending</h2>
      </GovRightContainerTitleArea>

      {lendingItem ? (
        <div className="list-wrapper">
          <LendingTabListItem>
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <div className="value">
                {assetData.icon ? (
                  <div className="img-wrapper">
                    <img src={assetData.icon} alt={`${assetData.name} logo`} />
                  </div>
                ) : (
                  <div className="no-icon">
                    <Icon id="noImage" />
                  </div>
                )}
                {assetData.name}
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lending</div>
              <CommaNumber value={lendingItem.lendValue} className="value" />
              {assetData.rate ? (
                <CommaNumber value={lendingItem.lendValue * assetData.rate} beginningText="$" className="rate" />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Lend APY</div>
              <CommaNumber value={lendingItem.lendAPY} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Interest Earned</div>
              <CommaNumber value={lendingItem.interestEarned} className="value" />
              {assetData.rate ? (
                <CommaNumber value={lendingItem.interestEarned * assetData.rate} beginningText="$" className="rate" />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Wallet Balance</div>
              <CommaNumber value={lendingItem.loanAssetWalletBalance} className="value" />
              {assetData.rate ? (
                <CommaNumber
                  value={lendingItem.loanAssetWalletBalance * assetData.rate}
                  beginningText="$"
                  className="rate"
                />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">m{assetData.name} Balance</div>
              <CommaNumber value={lendingItem.mBalance} className="value" />
            </ThreeLevelListItem>
            <Button
              text="Add"
              icon="plus"
              kind={TRANSPARENT_WITH_BORDER}
              onClick={() => {
                setAddLendingAssetModalData({
                  userBalance: lendingItem.loanAssetWalletBalance,
                  mBalance: lendingItem.mBalance,
                  lendingAPY: lendingItem.lendAPY,
                  assetRate: assetData.rate,
                  assetName: assetData.name,
                  assetIcon: assetData.icon,
                })
                setAddModal(true)
              }}
              className="lending-btn"
            />
            <Button
              text="Remove"
              icon="minus"
              kind={TRANSPARENT_WITH_BORDER}
              onClick={() => {
                setRemoveLendingAssetModalData({
                  userBalance: lendingItem.loanAssetWalletBalance,
                  mBalance: lendingItem.mBalance,
                  lendingAPY: lendingItem.lendAPY,
                  assetRate: assetData.rate,
                  assetName: assetData.name,
                  assetIcon: assetData.icon,
                  currentLendedAmount: lendingItem.lendValue,
                })
                setRemoveModal(true)
              }}
              className="lending-btn"
            />
          </LendingTabListItem>
        </div>
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>
          <Button
            text="Lend Asset"
            icon="plus"
            onClick={() => {
              setAddModal(true)
            }}
            kind={ACTION_PRIMARY}
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
