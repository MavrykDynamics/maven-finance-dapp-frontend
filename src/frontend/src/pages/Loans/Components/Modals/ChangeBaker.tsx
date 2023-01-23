import { useState, useMemo, useEffect } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DropDown, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import Icon from 'app/App.components/Icon/Icon.view'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { DropDownJsxChild, LoansModalBase } from './Modals.style'
import { DropDownXTZBakerType } from './CreateNewVault.modal'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

const MAVRYK_DYNAMICS_BAKERY = 1
const DAO_BAKERY = 2
const OTHER_BAKERY = 3

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238629&t=Sx2aEpp3ifrGxBtQ-0
export const ChangeBaker = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const { xtzBakers } = useSelector((state: State) => state.loans)
  const [activeTab, setActiveSliding] = useState(MAVRYK_DYNAMICS_BAKERY)

  const bakerySlidingButtons = useMemo(
    () => [
      { text: 'Mavryk Dynamics', id: MAVRYK_DYNAMICS_BAKERY, active: activeTab === MAVRYK_DYNAMICS_BAKERY },
      { text: 'The DAO', id: DAO_BAKERY, active: activeTab === DAO_BAKERY },
      { text: 'Other', id: OTHER_BAKERY, active: activeTab === OTHER_BAKERY },
    ],
    [activeTab],
  )

  const handleSlidingButtonClick = (tabId: number) => {
    setActiveSliding(bakerySlidingButtons.find(({ id }) => id === tabId)?.id ?? MAVRYK_DYNAMICS_BAKERY)
  }

  // select baker for an xtz collateral, used only when we selected one collateral XTZ
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
  const [bakerChosenDdItem, setBakerChosenDdItem] = useState<DropDownXTZBakerType | undefined>()
  const handleOnClickDropdownBakerItem = (itemId: number) =>
    setBakerChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))

  const updateBakerHandler = () => {}

  useEffect(() => {
    if (!show) {
      setBakerChosenDdItem(undefined)
    }
  }, [show])

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
                  <TzAddress className="value" tzAddress={bakerChosenDdItem.bakerAddress} type={BLUE} />
                ) : (
                  <div className="value">-</div>
                )
              ) : null}
              {activeTab === 1 ? (
                <TzAddress className="value" tzAddress={'hihibhyvyvuyvuyvuyvuyvuvuuvugug'} type={BLUE} />
              ) : null}
              {activeTab === 2 ? (
                <TzAddress className="value" tzAddress={'jkgugufftyfccvgvgvchgvvytvtgcchgchgc'} type={BLUE} />
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
