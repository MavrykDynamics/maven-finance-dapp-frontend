import { useLockBodyScroll } from 'react-use'
import { useState, useMemo, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { changeBakerAction } from 'pages/Loans/Actions/vaultPermissions.actions'
import { ChangeBakerPopupDataType } from './Modals.helpers'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import { DropDownXTZBakerType } from './CreateNewVault.modal'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { DropDownJsxChild, LoansModalBase } from './Modals.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

const MAVRYK_DYNAMICS_BAKERY = 1
const DAO_BAKERY = 2
const OTHER_BAKERY = 3

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
  const { bakerAddress = null, vaultAddress = '', xtzBakers } = data ?? {}
  const { otherBakers = [], dao, mavrykDynamics } = xtzBakers ?? {}

  const dispatch = useDispatch()
  const [activeTab, setActiveSliding] = useState(MAVRYK_DYNAMICS_BAKERY)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)

  useLockBodyScroll(show)

  useEffect(() => {
    // reset fields after closing the popup
    if (!show) {
      setBakerChosenDdItem(undefined)
      setSelectedAddress(null)
    } else {
      // open tab that corresponds to the delegated bakery
      setSelectedAddress(bakerAddress)

      const vaultBaker = bakerySlidingButtons.find(
        ({ bakeryAddresses }) => bakerAddress && bakeryAddresses.includes(bakerAddress),
      )

      // vault is delegated to
      if (vaultBaker) {
        setActiveSliding(vaultBaker.id)

        // delegated to other bakery, need to select
        if (vaultBaker.id === OTHER_BAKERY) {
          setBakerChosenDdItem(bakerItemsForDropDown.find(({ bakerAddress: ddAddress }) => ddAddress === bakerAddress))
        }
      }
    }
  }, [bakerAddress, show])

  const bakerySlidingButtons = useMemo(
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
    [mavrykDynamics?.name, mavrykDynamics?.address, activeTab, dao?.name, dao?.address, otherBakers],
  )

  const bakerItemsForDropDown = useMemo<DropDownXTZBakerType[]>(
    () =>
      otherBakers.map(({ name, fee, logo, address, yield: bakerYield, freespace }, idx) => ({
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              <ImageWithPlug imageLink={logo} alt={`${name} icon`} /> {name}
            </div>
            <div className="baker-fee">
              <CommaNumber value={fee} endingText="%" />
            </div>
          </DropDownJsxChild>
        ),
        bakerName: name,
        id: idx,
        bakerAddress: address,
        bakerYield,
        bakerFreeSpace: freespace,
      })),
    [otherBakers],
  )

  // click on tab btn
  const handleSlidingButtonClick = (tabId: number) => {
    const selectedBakeryTab = bakerySlidingButtons.find(({ id }) => id === tabId)
    setActiveSliding(selectedBakeryTab?.id ?? MAVRYK_DYNAMICS_BAKERY)
    setSelectedAddress(
      selectedBakeryTab?.id === OTHER_BAKERY
        ? bakerChosenDdItem?.bakerAddress ?? null
        : selectedBakeryTab?.bakeryAddresses?.[0] ?? null,
    )
  }

  // select baker for an xtz collateral, used only when we selected one collateral XTZ
  const [bakerChosenDdItem, setBakerChosenDdItem] = useState<DropDownXTZBakerType | undefined>()
  const handleOnClickDropdownBakerItem = (itemId: DDItemId) => {
    const ddChoosenItem = bakerItemsForDropDown.find(({ id }) => id === itemId)
    setBakerChosenDdItem(ddChoosenItem)
    setSelectedAddress(ddChoosenItem?.bakerAddress ?? null)
  }

  const updateBakerHandler = () => {
    if (selectedAddress && vaultAddress) {
      dispatch(changeBakerAction(selectedAddress, vaultAddress, closePopup))
    }
  }

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
              activeItem={bakerChosenDdItem}
              items={bakerItemsForDropDown}
              clickItem={handleOnClickDropdownBakerItem}
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
                bakerChosenDdItem?.bakerAddress ? (
                  <TzAddress className="value" tzAddress={bakerChosenDdItem.bakerAddress} type={BLUE} hasIcon={false} />
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
                bakerChosenDdItem?.bakerYield ? (
                  <CommaNumber value={bakerChosenDdItem.bakerYield} className="value" endingText="%" />
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
                bakerChosenDdItem?.bakerFreeSpace ? (
                  <CommaNumber value={bakerChosenDdItem.bakerFreeSpace} className="value" endingText="XTZ" />
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
