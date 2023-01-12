import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'
import { TabSwitcher } from 'pages/Council/Council.style'

// styles
import { VaultsStyled } from './Vaults.style'

// types
import { State } from '../../reducers'
import { VaultGQL } from 'utils/TypesAndInterfaces/Vaults'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { getVaultsStorage } from './Vaults.actions'

const tabsList: TabItem[] = [
  {
    text: 'All Vaults',
    id: 1,
    active: true,
  },
  {
    text: 'My Vaults',
    id: 2,
    active: false,
  },
]


export const VaultsView = () => {
  const dispatch = useDispatch()

  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { vaultsList } = useSelector((state: State) => state.vaults)

  const [filteredData, setFilteredData] = useState<VaultGQL[]>([])

  const handleChangeTabs = (tabId?: number) => {
    // 
  }

  useEffect(() => {
    if (vaultsList) {
      //
    }
  }, [vaultsList])

  useEffect(() => {
    dispatch(getVaultsStorage())
  }, [dispatch])

  return (
    <VaultsStyled>
      <TabSwitcher
        tabItems={tabsList}
        onClick={handleChangeTabs}
        className="tabSwitcher"
      />

      <VaultsSearchFilter />

      {vaultsList.map((item, index) => (
        <VaultsCard key={index} address={item.address} />
      ))}
    </VaultsStyled>
  )
}
