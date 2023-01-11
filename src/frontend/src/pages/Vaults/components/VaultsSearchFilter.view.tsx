import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components

// styles
import { VaultsSearchFilterStyled } from './../Vaults.style'

// types
import { State } from '../../../reducers'

export const VaultsSearchFilter = () => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  return (
    <VaultsSearchFilterStyled>
      
    </VaultsSearchFilterStyled>
  )
}
