import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { TabItem, TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { BorrowingTabListItemTabInfo } from '../LoansComponents.style'
import {
  ANY_USER,
  NONE_USER,
  VAULT_CARD_MENU_TABS,
  WHITELIST_USERS,
  assetDecimalsToShow,
  loansTabNames,
} from 'pages/Loans/Loans.const'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import Button from 'app/App.components/Button/NewButton'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'
import Icon from 'app/App.components/Icon/Icon.view'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TransactionHistory } from '../TransactionHistory'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { CollateralType, DepositorsFlagType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'
import { getNumberInBounds } from 'utils/calcFunctions'
import { calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVault'
import colors from 'styles/colors'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { State } from 'reducers'
import { isTezosAsset } from 'pages/Loans/Loans.helpers'

type Props = {
  openAddNewCollateralPopup: () => void
  openAddExistingCollateralPopup: (idx: number) => void
  openWithdrawCollateralPopup: ({ amount, idx }: { amount: number; idx: number }) => void
  openChangeBakerPopup: () => void
  openManagePermissionsPopup: () => void
  openUpdateMvkOperatorsPopup: () => void
  openChangeVaultNamePopup: () => void

  collateralData: CollateralType[]
  currentToken: LoanMarketType
  activeMenuTab?: TabItem
  isOwner: boolean
  vaultName: string
  vaultAddress: string
  xtzDelegatedTo: string | null
  sMVKDelegatedTo?: string
  collateralRatio: number
  deporsitorsFlag: DepositorsFlagType
  mappedMVKOperators: {
    amount?: number
    firstAddress?: string
  }
  hideTransactionHistory?: boolean
}

export const BorrowingExpandCardMenuSection = ({
  openAddNewCollateralPopup,
  openAddExistingCollateralPopup,
  openWithdrawCollateralPopup,
  openChangeBakerPopup,
  openManagePermissionsPopup,
  openUpdateMvkOperatorsPopup,
  openChangeVaultNamePopup,

  collateralData,
  currentToken,
  isOwner,
  vaultName,
  vaultAddress,
  xtzDelegatedTo,
  sMVKDelegatedTo,
  collateralRatio,
  deporsitorsFlag,
  mappedMVKOperators,
  hideTransactionHistory,
}: Props) => {
  const {
    config: { loansControllerAddress },
  } = useSelector((state: State) => state.loans)
  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const { transactionHistory } = currentToken 

  const menuTabs = useMemo(
    () =>
      VAULT_CARD_MENU_TABS.filter((item) => {
        if (hideTransactionHistory) {
          return item.id !== loansTabNames.TX_HISTORY
        }

        return true
      }),
    [hideTransactionHistory],
  )

  const [activeMenuTab, setActiveMenuTab] = useState(menuTabs.find((item) => item.active))

  const vaultHasXtzCollateral = collateralData.find(({ gqlName }) => isTezosAsset(gqlName))
  // TODO: test it when sMVK will be avaliable as collateral
  const vaultHasSmvkCollateral = collateralData.find(({ gqlName }) => gqlName === 'smvk')
  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

  const handleSwitchTab = (setActiveTab: (tab?: TabItem) => void) => (tabId: number) => {
    setActiveTab(menuTabs.find((item) => item.id === tabId))
  }

  return (
    <>
      <TabSwitcher tabItems={menuTabs} onClick={handleSwitchTab(setActiveMenuTab)} className="menu-switcher " />

      {activeMenuTab?.id === loansTabNames.COLLATERAL_ASSETS && (
        <BorrowingTabListItemTabInfo>
          <div className="tab-header">
            <H2Title>Your Collateralized Assets</H2Title>

            <Button
              onClick={openAddNewCollateralPopup}
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              isThin
              disabled={
                avaliableCollaterals.length === 0 ||
                avaliableCollaterals.length === collateralData.length - 1 ||
                isActionActive
              }
            >
              <Icon id="plus" /> Add Collateral Type
            </Button>
          </div>

          <Table className="borrowing-table">
            {collateralData.length ? (
              <TableHeader className="simple-header collateral">
                <TableRow>
                  <TableHeaderCell>Asset</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Collateral Share</TableHeaderCell>
                </TableRow>
              </TableHeader>
            ) : null}

            <TableBody>
              {collateralData.map(({ icon, amount, rate, gqlName, symbol }, idx) => {
                const isTotalRow = collateralData.length - 1 === idx

                const collateralShare = isTotalRow
                  ? 100
                  : getNumberInBounds(0, 100, calculateCollateralShare(amount * rate, collateralTotalBalance))

                if (isTotalRow && collateralData.length < 3) return null

                return (
                  <TableRow rowHeight={65} key={gqlName + '-' + idx}>
                    <TableCell width={'22%'} className="vert-middle">
                      {isTotalRow ? (
                        'Total'
                      ) : (
                        <div className="cell-content row with-icon">
                          <ImageWithPlug imageLink={icon} alt={`${gqlName} icon`} />
                          {symbol}
                        </div>
                      )}
                    </TableCell>

                    <TableCell width={'22%'}>
                      <div className="cell-content">
                        <CommaNumber
                          value={amount}
                          className="value"
                          showDecimal
                          decimalsToShow={isTotalRow ? 2 : assetDecimalsToShow}
                          beginningText={isTotalRow ? '$' : ''}
                        />
                        {rate ? (
                          <CommaNumber value={amount * rate} className="rate" beginningText="$" showDecimal />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell width={'22%'}>
                      <div className="cell-content">
                        <CommaNumber value={collateralShare} className="value" endingText="%" />
                      </div>
                    </TableCell>
                    {!isTotalRow && (
                      <TableCell className={`buttons borrowing ${!isOwner ? 'single-btn' : ''}`}>
                        <div className="cell-content row">
                          <Button
                            onClick={() => openAddExistingCollateralPopup(idx)}
                            form={BUTTON_WIDE}
                            kind={BUTTON_SECONDARY}
                            disabled={isActionActive}
                          >
                            <Icon id="plus" /> Add
                          </Button>
                          {isOwner ? (
                            <Button
                              onClick={() => openWithdrawCollateralPopup({ amount, idx })}
                              form={BUTTON_WIDE}
                              kind={BUTTON_SECONDARY}
                              disabled={collateralRatio <= 200 || isActionActive}
                            >
                              <Icon id="minus" /> Remove
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </BorrowingTabListItemTabInfo>
      )}

      {activeMenuTab?.id === loansTabNames.TX_HISTORY && (
        <TransactionHistory transactionHistory={transactionHistory} vaultAddress={vaultAddress} />
      )}

      {activeMenuTab?.id === loansTabNames.USEFUL_INFO && (
        <BorrowingTabListItemTabInfo>
          <H2Title>Useful Info</H2Title>

          <div className="useful-info">
            <div className="useful-info-line">
              <div className="name">Vault Name</div>
              <div className="value">{vaultName}</div>
              <Button kind={BUTTON_SIMPLE} disabled={!isOwner} onClick={openChangeVaultNamePopup}>
                Change <Icon id="paginationArrowLeft" />
              </Button>
            </div>

            <div className="useful-info-line">
              <div className="name">Vault Address</div>
              <div className="value">
                <TzAddress tzAddress={vaultAddress} type={BLUE} />
              </div>
            </div>

            <div className="useful-info-line">
              <div className="name">Lending Controller Address</div>
              <div className="value">
                <TzAddress tzAddress={loansControllerAddress} type={BLUE} />
              </div>
            </div>
          </div>

          {vaultHasXtzCollateral || vaultHasSmvkCollateral ? (
            <div className="useful-info">
              <div className="useful-info-title">Delegations</div>

              {vaultHasXtzCollateral ? (
                <div className="useful-info-line">
                  <div className="name">XTZ Delegated to</div>
                  <div className="value">
                    {xtzDelegatedTo ? <TzAddress tzAddress={xtzDelegatedTo} type={BLUE} /> : 'Not Delegated'}
                  </div>
                  <Button
                    kind={BUTTON_SIMPLE}
                    disabled={!collateralData.find(({ gqlName }) => isTezosAsset(gqlName)) || isActionActive}
                    onClick={openChangeBakerPopup}
                  >
                    Change Baker <Icon id="paginationArrowLeft" />
                  </Button>
                </div>
              ) : null}

              {vaultHasSmvkCollateral ? (
                <div className="useful-info-line">
                  <div className="name">sMVK Delegated to </div>
                  <div className="value">
                    {sMVKDelegatedTo ? <TzAddress tzAddress={sMVKDelegatedTo} type={BLUE} /> : 'None'}
                  </div>
                  <Link to={sMVKDelegatedTo ? `/satellites/satellite-details/${sMVKDelegatedTo}` : '/satellite-nodes'}>
                    <Button kind={BUTTON_SIMPLE}>
                      View Satellite <Icon id="paginationArrowLeft" />
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="useful-info">
            <div className="useful-info-title"> Permissions (Advanced)</div>

            <div className="useful-info-line">
              <div className="name">
                Depositors
                <CustomTooltip
                  iconId="info"
                  text="Depositors are tz and KT addresses that are allowed to deposit tokens and XTZ into your vault. For instance, if you delegate your XTZ to a bakery, you should add the bakery’s payout address as a a depositor so your vault can receive its delegation rewards."
                  defaultStrokeColor={colors[themeSelected].textColor}
                />
              </div>
              <div className="value">
                {deporsitorsFlag === ANY_USER ? 'Allow Any' : null}
                {deporsitorsFlag === NONE_USER ? 'Vault Owner' : null}
                {deporsitorsFlag === WHITELIST_USERS ? 'Defined Accounts' : null}
              </div>
              <Button kind={BUTTON_SIMPLE} onClick={openManagePermissionsPopup} disabled={isActionActive}>
                Update <Icon id="paginationArrowLeft" />
              </Button>
            </div>

            {vaultHasSmvkCollateral ? (
              <div className="useful-info-line">
                <div className="name">
                  MVK Operators
                  <CustomTooltip
                    iconId="info"
                    text="MVK operators are tz or KT addresses that you allow to perform specific actions with your tokens. Only use this if you know exactly what you are doing. By default, you have to allow the vault to do an operator of your sMVK so it can execute its required functions."
                    defaultStrokeColor={colors[themeSelected].textColor}
                  />
                </div>
                <div className="value">
                  {mappedMVKOperators.firstAddress
                    ? <TzAddress tzAddress={mappedMVKOperators.firstAddress} type={BLUE} /> +
                      ` ${mappedMVKOperators.amount ?? ''}`
                    : 'None'}
                </div>
                <Button kind={BUTTON_SIMPLE} disabled={true || isActionActive} onClick={openUpdateMvkOperatorsPopup}>
                  Update <Icon id="paginationArrowLeft" />
                </Button>
              </div>
            ) : null}
          </div>
        </BorrowingTabListItemTabInfo>
      )}
    </>
  )
}
