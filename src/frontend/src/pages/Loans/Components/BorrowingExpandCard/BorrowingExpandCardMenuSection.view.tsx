import { memo, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import qs from 'qs'

// styles
import { BorrowingTabListItemTabInfo } from '../LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// consts
import {
  ANY_USER,
  assetDecimalsToShow,
  loansTabNames,
  NONE_USER,
  VAULT_CARD_MENU_TABS,
  WHITELIST_USERS,
} from 'pages/Loans/Loans.const'
import { MINIMUN_COLLATERAL_RATIO_PERSENT } from 'providers/VaultsProvider/helpers/vaults.const'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'

// components
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TransactionHistory } from '../TransactionHistory'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { EmptyContainer } from 'app/App.style'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
  isMVRKAsset,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { calculateCollateralShare } from 'providers/VaultsProvider/helpers/vaults.utils'

// types
import { LoanMarketType } from 'providers/LoansProvider/loans.provider.types'
import { CollateralType, DepositorsFlagType } from 'providers/VaultsProvider/vaults.provider.types'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

type Props = {
  openAddNewCollateralPopup: () => void
  openAddExistingCollateralPopup: (idx: number) => void
  openWithdrawCollateralPopup: ({ amount, idx }: { amount: number; idx: number }) => void
  openChangeBakerPopup: () => void
  openManagePermissionsPopup: () => void
  openUpdateMvnOperatorsPopup: () => void
  openChangeVaultNamePopup: () => void

  collateralData: CollateralType[]
  currentToken: LoanMarketType
  activeMenuTab?: SlidingTabButtonType
  isOwner: boolean
  vaultName: string
  vaultAddress: string
  xtzDelegatedTo: string | null
  sMVNDelegatedTo?: string
  collateralRatio: number
  collateralBalance: number
  depositorsFlag: DepositorsFlagType
  hideTransactionHistory?: boolean
}

export const BorrowingExpandCardMenuSection = memo(({
  openAddNewCollateralPopup,
  openAddExistingCollateralPopup,
  openWithdrawCollateralPopup,
  openChangeBakerPopup,
  openManagePermissionsPopup,
  openUpdateMvnOperatorsPopup,
  openChangeVaultNamePopup,

  collateralData,
  currentToken,
  isOwner,
  vaultName,
  vaultAddress,
  xtzDelegatedTo,
  sMVNDelegatedTo,
  collateralRatio,
  collateralBalance,
  depositorsFlag,
  hideTransactionHistory,
}: Props) => {
  const { tokensMetadata, tokensPrices, collateralTokens } = useTokensContext()
  const {
    contractAddresses: { lendingControllerAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { page, ...restQP } = qs.parse(search, { ignoreQueryPrefix: true })

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

  const vaultHasMVRKCollateral = collateralData.find(({ tokenAddress }) => isMVRKAsset(tokenAddress))

  // TODO: test it when sMVN will be available as collateral
  const vaultHasSmvnCollateral = collateralData.find(({ tokenAddress }) => tokenAddress === SMVN_TOKEN_ADDRESS)

  const handleSwitchTab = (setActiveTab: (tab?: SlidingTabButtonType) => void) => (newTabId: number) => {
    // condition to set list page to 1, when change tab
    if (activeMenuTab?.id === loansTabNames.TX_HISTORY && activeMenuTab?.id !== newTabId) {
      navigate(`${pathname}${qs.stringify(restQP, { addQueryPrefix: true })}`, { replace: true })
    }

    setActiveTab(menuTabs.find((item) => item.id === newTabId))
  }

  return (
    <>
      <SlidingTabButtons
        kind={SECONDARY_SLIDING_TAB_BUTTONS}
        tabItems={menuTabs}
        onClick={handleSwitchTab(setActiveMenuTab)}
      />

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
                collateralTokens.length === 0 || collateralTokens.length === collateralData.length || isActionActive
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
            ) : (
              <EmptyContainer
                style={{
                  padding: '30px 0 20px 0',
                }}
              >
                <img src="/images/not-found.svg" alt=" No Transaction History to show" />
                <figcaption>No Collateralized Assets to show</figcaption>
              </EmptyContainer>
            )}

            <TableBody>
              {collateralData
                .sort((a, b) => b.amount - a.amount)
                .map(({ amount, tokenAddress }, idx) => {
                  const collateralToken = getTokenDataByAddress({
                    tokenAddress,
                    tokensMetadata,
                    tokensPrices,
                  })

                  if (!collateralToken || !collateralToken.rate || !checkWhetherTokenIsCollateralToken(collateralToken))
                    return null

                  const { symbol, icon, rate, decimals } = collateralToken

                  const convertedAmount = convertNumberForClient({ number: amount, grade: decimals })
                  const collateralShare = calculateCollateralShare(convertedAmount * rate, collateralBalance)

                  return (
                    <TableRow $rowHeight={65} key={symbol}>
                      <TableCell $width={'22%'} className="vert-middle">
                        <div className="cell-content row with-icon">
                          <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} useRounded />
                          {symbol}
                        </div>
                      </TableCell>

                      <TableCell $width={'22%'}>
                        <div className="cell-content">
                          <CommaNumber value={convertedAmount} className="value" showDecimal decimalsToShow={2} />
                          <CommaNumber value={convertedAmount * rate} className="rate" beginningText="$" showDecimal />
                        </div>
                      </TableCell>
                      <TableCell $width={'22%'}>
                        <div className="cell-content">
                          <CommaNumber value={collateralShare} className="value" endingText="%" />
                        </div>
                      </TableCell>
                      <TableCell className={`buttons borrowing ${!isOwner ? 'single-btn' : ''}`}>
                        <div className="cell-content row">
                          <Button
                            onClick={() => openAddExistingCollateralPopup(idx)}
                            form={BUTTON_WIDE}
                            kind={BUTTON_SECONDARY}
                            disabled={isActionActive || collateralToken.loanData.isPausedCollateral}
                          >
                            <Icon id="plus" /> Add
                          </Button>
                          {isOwner ? (
                            <Button
                              onClick={() =>
                                openWithdrawCollateralPopup({
                                  amount: convertedAmount,
                                  idx,
                                })
                              }
                              form={BUTTON_WIDE}
                              kind={BUTTON_SECONDARY}
                              disabled={
                                collateralRatio <= MINIMUN_COLLATERAL_RATIO_PERSENT ||
                                isActionActive ||
                                convertedAmount === 0
                              }
                            >
                              <Icon id="minus" /> Remove
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}

              {/* Total row */}
              {collateralData.length >= 2 ? (
                <TableRow $rowHeight={44}>
                  <TableCell $width={'22%'} className="vert-middle">
                    Total
                  </TableCell>

                  <TableCell $width={'22%'}>
                    <div className="cell-content">
                      <CommaNumber value={collateralBalance} decimalsToShow={2} beginningText="$" className="balance" />
                    </div>
                  </TableCell>

                  <TableCell $width={'22%'}>
                    <CommaNumber value={100} endingText="%" />
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </BorrowingTabListItemTabInfo>
      )}

      {activeMenuTab?.id === loansTabNames.TX_HISTORY && (
        <TransactionHistory vaultAddress={vaultAddress} loanTokenAddress={currentToken.loanTokenAddress} />
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
                <TzAddress tzAddress={vaultAddress} type={PRIMARY_TZ_ADDRESS_COLOR} />
              </div>
            </div>

            <div className="useful-info-line">
              <div className="name">Lending Controller Address</div>
              <div className="value">
                {lendingControllerAddress ? (
                  <TzAddress tzAddress={lendingControllerAddress} type={PRIMARY_TZ_ADDRESS_COLOR} />
                ) : (
                  '–'
                )}
              </div>
            </div>
          </div>

          {vaultHasMVRKCollateral || vaultHasSmvnCollateral ? (
            <div className="useful-info">
              <div className="useful-info-title">Delegations</div>

              {vaultHasMVRKCollateral ? (
                <div className="useful-info-line">
                  <div className="name">MVRK Delegated to</div>
                  <div className="value">
                    {xtzDelegatedTo ? (
                      <TzAddress tzAddress={xtzDelegatedTo} type={PRIMARY_TZ_ADDRESS_COLOR} />
                    ) : (
                      'Not Delegated'
                    )}
                  </div>
                  <Button
                    kind={BUTTON_SIMPLE}
                    disabled={!vaultHasMVRKCollateral || isActionActive}
                    onClick={openChangeBakerPopup}
                  >
                    Change Validator <Icon id="paginationArrowLeft" />
                  </Button>
                </div>
              ) : null}

              {vaultHasSmvnCollateral ? (
                <div className="useful-info-line">
                  <div className="name">sMVN Delegated to</div>
                  <div className="value">
                    {sMVNDelegatedTo ? (
                      <TzAddress tzAddress={sMVNDelegatedTo} type={PRIMARY_TZ_ADDRESS_COLOR} />
                    ) : (
                      'None'
                    )}
                  </div>
                  <Link to={sMVNDelegatedTo ? `/satellites/satellite-details/${sMVNDelegatedTo}` : '/satellite-nodes'}>
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
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Depositors are mv and KT addresses that are allowed to deposit tokens and MVRK into your vault. For
                    instance, if you delegate your MVRK to a Validator, you should add the Validator’s payout address as
                    a a depositor so your vault can receive its delegation rewards.
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <div className="value">
                {depositorsFlag === ANY_USER ? 'Allow Any' : null}
                {depositorsFlag === NONE_USER ? 'Vault Owner' : null}
                {depositorsFlag === WHITELIST_USERS ? 'Defined Accounts' : null}
              </div>
              <Button kind={BUTTON_SIMPLE} onClick={openManagePermissionsPopup} disabled={isActionActive}>
                Update <Icon id="paginationArrowLeft" />
              </Button>
            </div>

            {/* {vaultHasSmvnCollateral ? (
              <div className="useful-info-line">
                <div className="name">
                  MVN Operators
                  <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    MVN operators are tz or KT addresses that you allow to perform specific actions with your tokens. Only use this if you know exactly what you are doing. By default, you have to allow the vault to do an operator of your sMVN so it can execute its required functions.
                  </Tooltip.Content>
                </Tooltip>
                </div>
                <div className="value">
                  {mappedMVNOperators.firstAddress ? (
                    <>
                      <TzAddress tzAddress={mappedMVNOperators.firstAddress} type={PRIMARY_TZ_ADDRESS_COLOR} />
                      {mappedMVNOperators.amount ?? ''}
                    </>
                  ) : (
                    'None'
                  )}
                </div>
                <Button kind={BUTTON_SIMPLE} disabled={true || isActionActive} onClick={openUpdateMvnOperatorsPopup}>
                  Update <Icon id="paginationArrowLeft" />
                </Button>
              </div>
            ) : null} */}
          </div>
        </BorrowingTabListItemTabInfo>
      )}
    </>
  )
})
BorrowingExpandCardMenuSection.displayName = 'BorrowingExpandCardMenuSection'
