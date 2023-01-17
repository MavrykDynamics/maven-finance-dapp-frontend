import { useMemo, useState } from 'react'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DropDownItemType, DropDown } from 'app/App.components/DropDown/NewDropdown'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Input } from 'app/App.components/Input/NewInput'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

import { InputPinnedDropDown } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { DropDownJsxChild, LoansModalBase, VaultModalOverview } from './Modals.style'

const COLORS_BREAKPOINTS = [
  {
    persentage: 0,
    color: {
      r: 255,
      g: 67,
      b: 67,
    },
  },
  {
    persentage: 33,
    color: {
      r: 255,
      g: 129,
      b: 67,
    },
  },
  {
    persentage: 66,
    color: {
      r: 251,
      g: 255,
      b: 67,
    },
  },
  {
    persentage: 100,
    color: {
      r: 52,
      g: 246,
      b: 106,
    },
  },
]

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239633&t=Sx2aEpp3ifrGxBtQ-0
export const AddNewCollateral = ({ closePopup, show }: { closePopup: () => void; show: boolean }) => {
  const [inputAmount, setInputAmount] = useState('0')

  const collateralItemsForDropDown = useMemo<(DropDownItemType & { asset: string })[]>(
    () => [
      {
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              <Icon id="xtzTezos" /> XTZ
            </div>
          </DropDownJsxChild>
        ),
        id: 1,
        asset: 'tez',
      },
      {
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              <Icon id="noImage" /> EURL
            </div>
          </DropDownJsxChild>
        ),
        id: 2,

        asset: 'eurl',
      },
      {
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              <Icon id="noImage" /> USDT
            </div>
          </DropDownJsxChild>
        ),
        id: 3,
        asset: 'usdt',
      },
    ],
    [],
  )

  const [collateralChosenDdItem, setCollateralChosenDdItem] = useState<
    (DropDownItemType & { asset: string }) | undefined
  >(collateralItemsForDropDown[0])

  const handleOnClickDropdownCollateralItem = (itemId: number) => {
    setCollateralChosenDdItem(collateralItemsForDropDown.find(({ id }) => id === itemId))
  }

  const bakerItemsForDropDown = useMemo<DropDownItemType[]>(
    () => [
      {
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
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
            <div className="flex-row with-image">
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
            <div className="flex-row with-image">
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

  const [bakerChosenDdItem, setAssetChosenDdItem] = useState<DropDownItemType | undefined>()

  const handleOnClickDropdownBakerItem = (itemId: number) => {
    setAssetChosenDdItem(bakerItemsForDropDown.find(({ id }) => id === itemId))
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Add More Assets As Collateral</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select an assets to add as collateral to an existing vault.</div>

          <VaultModalOverview style={{ marginBottom: '45px' }}>
            <ThreeLevelListItem className="collateral-diagram">
              <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
              <GradientDiagram className="loansModals" colorBreakpoints={COLORS_BREAKPOINTS} currentPersentage={50} />
              <div className="info-tip">
                Collateral Value:
                <span>
                  <CommaNumber value={0} beginningText="$" />
                </span>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={0} className="value" />
              {false ? <CommaNumber value={0} beginningText="$" className="rate" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={0} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <Input
            className="withdrawCollateralInput pinned-dropdown"
            inputProps={{
              value: inputAmount,
              type: 'number',
              onChange: (e) => setInputAmount(e.target.value),
            }}
            settings={{
              balance: 1,
              balanceAsset: 'XTZ',
              useMaxHandler: () => setInputAmount('1000'),
              inputStatus: '',
              convertedValue: 1,
            }}
          >
            <InputPinnedDropDown>
              <DropDown
                placeholder="Select Bakery"
                activeItem={collateralChosenDdItem}
                items={collateralItemsForDropDown}
                clickItem={handleOnClickDropdownCollateralItem}
                className="input-dropdown"
              />
            </InputPinnedDropDown>
          </Input>

          {collateralChosenDdItem?.asset === 'tez' ? (
            <>
              <div className="block-name">Select Baker</div>
              <DropDown
                placeholder="Select Bakery"
                activeItem={bakerChosenDdItem}
                items={bakerItemsForDropDown}
                clickItem={handleOnClickDropdownBakerItem}
              />
              <div className="lending-stats" style={{ margin: '30px 0' }}>
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
            </>
          ) : null}

          <div className="block-name">New Vault Status</div>
          <VaultModalOverview>
            <ThreeLevelListItem className="collateral-diagram">
              <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
              <GradientDiagram className="loansModals" colorBreakpoints={COLORS_BREAKPOINTS} currentPersentage={50} />
              <div className="info-tip">
                Collateral Value:
                <span>
                  <CommaNumber value={0} beginningText="$" />
                </span>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={0} className="value" />
              {false ? <CommaNumber value={0} beginningText="$" className="rate" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={0} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
