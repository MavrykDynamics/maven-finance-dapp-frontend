import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { State } from 'reducers'
import { ChangeBakerPopupDataType } from './Modals.helpers'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DropDown } from 'app/App.components/DropDown/NewDropdown'
import Icon from 'app/App.components/Icon/Icon.view'
import { DropDownXTZBakerType } from './CreateNewVault.modal'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { DropDownJsxChild, LoansModalBase } from './Modals.style'
import { changeBakerAction } from 'pages/Loans/Actions/vaultPermissions.actions'

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
  const { bakerAddress = null } = data ?? {}

  const dispatch = useDispatch()
  const { xtzBakers } = useSelector((state: State) => state.loans)
  const [activeTab, setActiveSliding] = useState(MAVRYK_DYNAMICS_BAKERY)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)

  useEffect(() => {
    setSelectedAddress(bakerAddress)
    if (!show) {
      setBakerChosenDdItem(undefined)
    }
  }, [bakerAddress, show])

  const bakerySlidingButtons = useMemo(
    () => [
      {
        text: 'Mavryk Dynamics',
        id: MAVRYK_DYNAMICS_BAKERY,
        active: activeTab === MAVRYK_DYNAMICS_BAKERY,
        bakeryAddresses: ['mavrykBakeryAddress'],
      },
      { text: 'The DAO', id: DAO_BAKERY, active: activeTab === DAO_BAKERY, bakeryAddresses: ['DAOBakeryAddress'] },
      {
        text: 'Other',
        id: OTHER_BAKERY,
        active: activeTab === OTHER_BAKERY,
        bakeryAddresses: xtzBakers.map(({ address }) => address),
      },
    ],
    [activeTab, xtzBakers],
  )

  const bakerItemsForDropDown = useMemo<DropDownXTZBakerType[]>(
    () =>
      xtzBakers.map(({ name, fee, logo, address, yield: bakerYield, freespace }, idx) => ({
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              {logo ? (
                <div className="image-wrapper">
                  <img src={logo} alt={name + '-logo'} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}{' '}
              {name}
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
    [xtzBakers],
  )

  useEffect(() => {
    // vault isn't delegated to baker
    if (bakerAddress === null) {
      return
    }

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
  }, [bakerAddress, bakerItemsForDropDown, bakerySlidingButtons])

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
  const handleOnClickDropdownBakerItem = (itemId: number) => {
    const ddChoosenItem = bakerItemsForDropDown.find(({ id }) => id === itemId)
    setBakerChosenDdItem(ddChoosenItem)
    setSelectedAddress(ddChoosenItem?.bakerAddress ?? null)
  }

  const updateBakerHandler = () => {
    if (selectedAddress) {
      dispatch(changeBakerAction(selectedAddress, closePopup))
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
              auctor id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et ligula
              fringilla, tempus sapien eget, pellentesque orci. Donec finibus quam rhoncus, fringilla ex ut, feugiat
              nulla. Curabitur tristique augue non ante hendrerit ultrices
            </div>
          ) : null}

          {activeTab === 2 ? (
            <div className="modalDescr" style={{ marginTop: '30px' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
              auctor id. Vestibfgnsijfdn gihdfbh gbfdgbdfish bgdfios bgoshdfbhousfdb ghbsd ughfdbgodsfb guhbdf gubds
              ugbds ubgyd gfdngjisfdngjsndig fbd gbdfsihgb dfs hoidfbgh bdsfgho dbfgh bhfdbgihdsb gds uohbdfgb dfhsb
              gbdfs]g sdf sgnjfdgnpisfdngidfbgd
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
              {activeTab === 3 ? (
                bakerChosenDdItem?.bakerAddress ? (
                  <TzAddress className="value" tzAddress={bakerChosenDdItem.bakerAddress} type={BLUE} hasIcon={false} />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
              {activeTab === 1 ? (
                <TzAddress
                  className="value"
                  tzAddress={'hihibhyvyvuyvuyvuyvuyvuvuuvugug'}
                  type={BLUE}
                  hasIcon={false}
                />
              ) : null}
              {activeTab === 2 ? (
                <TzAddress
                  className="value"
                  tzAddress={'jkgugufftyfccvgvgvchgvvytvtgcchgchgc'}
                  type={BLUE}
                  hasIcon={false}
                />
              ) : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Yield</div>
              {activeTab === 3 ? (
                bakerChosenDdItem?.bakerYield ? (
                  <CommaNumber value={bakerChosenDdItem.bakerYield} className="value" endingText="%" />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
              {activeTab === 1 ? <CommaNumber value={11} className="value" endingText="%" /> : null}
              {activeTab === 2 ? <CommaNumber value={22} className="value" endingText="%" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Free Capacity</div>
              {activeTab === 3 ? (
                bakerChosenDdItem?.bakerFreeSpace ? (
                  <CommaNumber value={bakerChosenDdItem.bakerFreeSpace} className="value" endingText="XTZ" />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
              {activeTab === 1 ? <CommaNumber value={1111} className="value" endingText="XTZ" /> : null}
              {activeTab === 2 ? <CommaNumber value={2222} className="value" endingText="XTZ" /> : null}
            </ThreeLevelListItem>
          </div>

          <NewButton kind={ACTION_PRIMARY} onClick={updateBakerHandler} className="modal-manage-btn">
            Update Baker
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
