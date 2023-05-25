import { useEffect, useState } from 'react'
import { useTokensContext } from '../tokens.provider'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { useQuery } from '@apollo/client'

type InternalState = {
  tokensAddress: string | null
}

// TODO: will be updated with tokens reorganization task
export const useTokensInit = () => {
  console.log('useTokensInit')
}
