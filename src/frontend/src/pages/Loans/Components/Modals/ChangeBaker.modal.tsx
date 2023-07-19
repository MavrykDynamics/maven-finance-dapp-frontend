import { useLockBodyScroll } from 'react-use'
import { useState, useMemo, useEffect, useCallback } from 'react'

// actions
import { changeBakerAction } from 'providers/VaultsProvider/actions/vaultPermissions.actions'

// types
import { ChangeBakerPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'

// styles
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { CHANGE_BAKER_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// providers
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const MAVRYK_DYNAMICS_BAKERY = 1
const DAO_BAKERY = 2
const OTHER_BAKERY = 3
type BakersSlidingButtonTab = typeof MAVRYK_DYNAMICS_BAKERY | typeof DAO_BAKERY | typeof OTHER_BAKERY

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238629&t=Sx2aEpp3ifrGxBtQ-0
export const ChangeBaker = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ChangeBakerPopupDataType
}) => {
  const { bakerAddress = null, vaultAddress = '' } = data ?? {}

  const { xtzBakers } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const { otherBakers = [], dao, mavrykDynamics } = xtzBakers ?? {}
  const { bakers, choosenBaker, setChoosenBaker } = useXtzBakersForDD(true)

  const [activeTab, setActiveSliding] = useState<BakersSlidingButtonTab>(MAVRYK_DYNAMICS_BAKERY)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)

  useLockBodyScroll(show)

  const bakerySlidingButtons = useMemo<
    Array<{
      text: string
      id: BakersSlidingButtonTab
      active: boolean
      bakeryAddresses: Array<string>
      isDisabled?: boolean
    }>
  >(
    () => [
      {
        text: mavrykDynamics?.name ?? 'Mavryk Dynamics',
        id: MAVRYK_DYNAMICS_BAKERY,
        active: activeTab === MAVRYK_DYNAMICS_BAKERY,
        bakeryAddresses: [mavrykDynamics?.address ?? ''],
        isDisabled: mavrykDynamics?.isDisabled,
      },
      {
        text: dao?.name ?? 'The DAO',
        id: DAO_BAKERY,
        active: activeTab === DAO_BAKERY,
        bakeryAddresses: [dao?.address ?? ''],
        isDisabled: dao?.isDisabled,
      },
      {
        text: 'Other',
        id: OTHER_BAKERY,
        active: activeTab === OTHER_BAKERY,
        bakeryAddresses: otherBakers.map(({ address }) => address),
      },
    ],
    [
      mavrykDynamics?.name,
      mavrykDynamics?.address,
      mavrykDynamics?.isDisabled,
      activeTab,
      dao?.name,
      dao?.address,
      dao?.isDisabled,
      otherBakers,
    ],
  )

  useEffect(() => {
    // reset fields after closing the popup
    if (!show) {
      setSelectedAddress(null)
    } else {
      // open tab that corresponds to the delegated bakery
      setSelectedAddress(bakerAddress)

      const vaultBaker = bakerySlidingButtons.find(
        ({ bakeryAddresses }) => bakerAddress && bakeryAddresses.includes(bakerAddress),
      )

      // vault is delegated to
      if (vaultBaker && bakerAddress) {
        setActiveSliding(vaultBaker.id)

        // delegated to other bakery, need to select
        if (vaultBaker.id === OTHER_BAKERY) {
          setChoosenBaker(bakerAddress)
        }
      }
    }
  }, [bakerAddress, bakerySlidingButtons, setChoosenBaker, show])

  // click on tab btn
  const handleSlidingButtonClick = (tabId: number) => {
    const selectedBakeryTab = bakerySlidingButtons.find(({ id }) => id === tabId)
    setActiveSliding(selectedBakeryTab?.id ?? MAVRYK_DYNAMICS_BAKERY)
    setSelectedAddress(
      selectedBakeryTab?.id === OTHER_BAKERY
        ? choosenBaker?.bakerAddress ?? null
        : selectedBakeryTab?.bakeryAddresses?.[0] ?? null,
    )
  }

  // change baker action ---------------------------------
  const changeBakerActionCb = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (selectedAddress && vaultAddress) {
      return await changeBakerAction(selectedAddress, vaultAddress, closePopup)
    }

    return null
  }, [bug, closePopup, selectedAddress, userAddress, vaultAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CHANGE_BAKER_ACTION,
      actionFn: changeBakerActionCb,
    }),
    [changeBakerActionCb],
  )

  const updateBakerHandler = useContractAction(contractActionProps)

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Change Baker</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Please choose the Bakery to delegate your XTZ.</div>

          <SlidingTabButtons tabItems={bakerySlidingButtons} className="tab-bar" onClick={handleSlidingButtonClick} />

          {activeTab === 1 ? (
            <div className="modalDescr" style={{ marginTop: '30px' }}>
              {mavrykDynamics?.description ?? ''}
            </div>
          ) : null}

          {activeTab === 2 ? (
            <div className="modalDescr" style={{ marginTop: '30px' }}>
              {dao?.description ?? ''}
            </div>
          ) : null}

          {activeTab === 3 ? (
            <DropDown
              placeholder="Select Bakery"
              activeItem={choosenBaker}
              items={bakers}
              clickItem={(itemId: DDItemId) => {
                const ddChoosenItemAddress = bakers.find(({ id }) => id === itemId)?.bakerAddress

                if (ddChoosenItemAddress) {
                  setChoosenBaker(ddChoosenItemAddress)
                }
                setSelectedAddress(ddChoosenItemAddress ?? null)
              }}
              className="change-bakery "
            />
          ) : null}

          <div className="lending-stats">
            <ThreeLevelListItem>
              <div className="name">Bakery Address</div>
              {activeTab === 1 ? (
                <TzAddress className="value" tzAddress={mavrykDynamics?.address ?? ''} type={BLUE} hasIcon={false} />
              ) : null}

              {activeTab === 2 ? (
                <TzAddress className="value" tzAddress={dao?.address ?? ''} type={BLUE} hasIcon={false} />
              ) : null}

              {activeTab === 3 ? (
                choosenBaker ? (
                  <TzAddress className="value" tzAddress={choosenBaker.bakerAddress} type={BLUE} hasIcon={false} />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
            </ThreeLevelListItem>
            {activeTab !== 3 && (
              <ThreeLevelListItem>
                <div className="name">Bakery Payout Address</div>
                {activeTab === 1 ? (
                  <TzAddress
                    className="value"
                    tzAddress="tz1WHZYyDqUEj5BLjofe3jctmb9wN61KeMco"
                    type={BLUE}
                    hasIcon={false}
                  />
                ) : null}

                {activeTab === 2 ? (
                  <TzAddress
                    className="value"
                    tzAddress="tz1LWEHti5PD7HZEgGrog6D5fxg8Pt8WSNyy"
                    type={BLUE}
                    hasIcon={false}
                  />
                ) : null}
              </ThreeLevelListItem>
            )}
            <ThreeLevelListItem>
              <div className="name">Yield</div>
              {activeTab === 1 ? (
                <CommaNumber value={mavrykDynamics?.yield ?? 0} className="value" endingText="%" />
              ) : null}

              {activeTab === 2 ? <CommaNumber value={dao?.yield ?? 0} className="value" endingText="%" /> : null}

              {activeTab === 3 ? (
                choosenBaker ? (
                  <CommaNumber value={choosenBaker.bakerYield} className="value" endingText="%" />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Free Capacity</div>
              {activeTab === 1 ? (
                <CommaNumber value={mavrykDynamics?.freespace ?? 0} className="value" endingText="XTZ" />
              ) : null}

              {activeTab === 2 ? <CommaNumber value={dao?.freespace ?? 0} className="value" endingText="XTZ" /> : null}

              {activeTab === 3 ? (
                choosenBaker ? (
                  <CommaNumber value={choosenBaker.bakerFreeSpace} className="value" endingText="XTZ" />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
            </ThreeLevelListItem>
          </div>

          <div className="manage-btn">
            <NewButton
              kind={BUTTON_PRIMARY}
              onClick={updateBakerHandler}
              form={BUTTON_WIDE}
              disabled={!selectedAddress || selectedAddress === bakerAddress}
            >
              Update Baker
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
