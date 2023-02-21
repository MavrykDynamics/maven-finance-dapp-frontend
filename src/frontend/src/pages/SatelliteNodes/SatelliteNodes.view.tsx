import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { SATELITES_NODES_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { DropDown, DropdownItemType } from 'app/App.components/DropDown/DropDown.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import SatteliteList from 'pages/Satellites/SatelliteList/SatellitesList.view'
import { NotStakinkBanner } from 'pages/Satellites/components/NotStakingBanner.view'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'

type OracleSatellitesViewProps = {
  handleSelect: (item: { text: string; value: string }) => void
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  satellitesList: Array<SatelliteRecord>
  delegateCallback: (address: string) => void
  undelegateCallback: (address: string) => void
  balanceOk: boolean
  accountPkh?: string
}

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)

const OracleSatellitesView = ({
  handleSelect,
  handleSearch,
  satellitesList,
  delegateCallback,
  undelegateCallback,
  balanceOk,
  accountPkh,
}: OracleSatellitesViewProps) => {
  const { satelliteMvkIsDelegatedTo } = useSelector((state: State) => state.wallet.user)

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [inputSearch, setInputSearch] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  return (
    <Page>
      <PageHeader page={'satellites'} />

      <NotStakinkBanner
        accountPkh={accountPkh}
        balanceOk={balanceOk}
        text="You are currently not staking MVK, please stake MVK in order to delegate to a satellite
        or become your own and take part in the platform’s governance"
      />

      <PageContent>
        <div className="left-content-wrapper">
          <SatelliteSearchFilter>
            <Input
              type="text"
              kind={'search'}
              placeholder="Search by address or name..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setInputSearch(e.target.value)
                handleSearch(e)
              }}
              value={inputSearch}
            />
            <DropdownContainer>
              <h4>Order by:</h4>
              <DropDown
                placeholder="Choose option"
                isOpen={ddIsOpen}
                setIsOpen={setDdIsOpen}
                itemSelected={chosenDdItem?.text}
                items={ddItems}
                clickOnItem={(e) => handleOnClickDropdownItem(e)}
              />
            </DropdownContainer>
          </SatelliteSearchFilter>

          {satellitesList.length ? (
            <SatteliteList
              items={satellitesList}
              listType={'satellites'}
              name={SATELITES_NODES_LIST_NAME}
              onClickHandler={() => null}
              additionaldata={{
                isAllOracles: true,
                fullUtemsCount: satellitesList.length,
                satelliteUserIsDelegatedTo: satelliteMvkIsDelegatedTo,
                delegateCallback,
                undelegateCallback,
              }}
              balanceOk={balanceOk}
            />
          ) : (
            emptyContainer
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default OracleSatellitesView
