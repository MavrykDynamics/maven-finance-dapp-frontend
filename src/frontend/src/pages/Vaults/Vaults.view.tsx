import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'

// styles
import { VaultsStyled } from './Vaults.style'

// types
import { State } from '../../reducers'

export const VaultsView = () => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  return (
    <VaultsStyled>
      <VaultsSearchFilter />
      <VaultsCard></VaultsCard>
    </VaultsStyled>
  )
}
