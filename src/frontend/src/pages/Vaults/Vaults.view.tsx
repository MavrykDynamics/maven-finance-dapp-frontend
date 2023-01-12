import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'

// styles
import { VaultsStyled } from './Vaults.style'

// types
import { State } from '../../reducers'

// actions
import { getVaultsStorage } from './Vaults.actions'

export const VaultsView = () => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { vaultsList } = useSelector((state: State) => state.vaults)

  useEffect(() => {
    dispatch(getVaultsStorage())
  }, [dispatch])

  return (
    <VaultsStyled>
      <VaultsSearchFilter />
      {vaultsList.map((item, index) => (
        <VaultsCard key={index} address={item.address} />
      ))}
    </VaultsStyled>
  )
}
