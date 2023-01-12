import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DropDown, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import Icon from 'app/App.components/Icon/Icon.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { useState, useMemo } from 'react'
import { DropDownJsxChild, LoansModalBase } from './Modals.style'

const MAVRYK_DYNAMICS_BAKERY = 1
const DAO_BAKERY = 2
const OTHER_BAKERY = 3

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238629&t=Sx2aEpp3ifrGxBtQ-0
export const ChangeBaker = ({ closePopup }: { closePopup: () => void }) => {
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

  const itemsForDropDown = useMemo<DropDownItemType[]>(
    () => [
      {
        content: (
          <DropDownJsxChild>
            <div className="baker-name">
              <Icon id="noImage" /> 1111
            </div>
            <div className="baker-fee">
              <CommaNumber value={3.32} endingText="%" />
            </div>
          </DropDownJsxChild>
        ),
        id: 1,
      },
      {
        content: (
          <DropDownJsxChild>
            <div className="baker-name">
              <Icon id="noImage" /> 22222
            </div>
            <div className="baker-fee">
              <CommaNumber value={3.32} endingText="%" />
            </div>
          </DropDownJsxChild>
        ),
        id: 2,
      },
      {
        content: (
          <DropDownJsxChild>
            <div className="baker-name">
              <Icon id="noImage" /> 33333
            </div>
            <div className="baker-fee">
              <CommaNumber value={3.32} endingText="%" />
            </div>
          </DropDownJsxChild>
        ),
        id: 3,
      },
    ],
    [],
  )

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const handleOnClickDropdownItem = (itemId: number) => {
    setChosenDdItem(itemsForDropDown.find(({ id }) => id === itemId))
    setDdIsOpen(!ddIsOpen)
  }
  const updateBakerHandler = () => {}

  return (
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
          auctor id. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum
          ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et ligula fringilla, tempus
          sapien eget, pellentesque orci. Donec finibus quam rhoncus, fringilla ex ut, feugiat nulla. Curabitur
          tristique augue non ante hendrerit ultrices
        </div>
      ) : null}

      {activeTab === 2 ? (
        <div className="modalDescr" style={{ marginTop: '30px' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod tincidunt felis, ac vehicula tellus
          auctor id. Vestibfgnsijfdn gihdfbh gbfdgbdfish bgdfios bgoshdfbhousfdb ghbsd ughfdbgodsfb guhbdf gubds ugbds
          ubgyd gfdngjisfdngjsndig fbd gbdfsihgb dfs hoidfbgh bdsfgho dbfgh bhfdbgihdsb gds uohbdfgb dfhsb gbdfs]g sdf
          sgnjfdgnpisfdngidfbgd
        </div>
      ) : null}

      {activeTab === 3 ? (
        <DropDown
          placeholder="Select Bakery"
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          activeItem={chosenDdItem}
          items={itemsForDropDown}
          clickItem={handleOnClickDropdownItem}
          className="change-bakery "
        />
      ) : null}

      <div className="lending-stats">
        <ThreeLevelListItem>
          <div className="name">Bakery Address</div>
          <TzAddress className="value" tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Yield</div>
          <CommaNumber value={2.13} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Free Capacity</div>
          <CommaNumber value={2412} className="value" endingText="XTZ" />
        </ThreeLevelListItem>
      </div>

      <NewButton kind={ACTION_PRIMARY} onClick={updateBakerHandler} className="modal-manage-btn">
        Update Baker
      </NewButton>
    </LoansModalBase>
  )
}
