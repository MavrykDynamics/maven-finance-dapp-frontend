import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { GLASS_BROKEN_SUB, WHITE_LIST_DEVELOPERS_SUB } from 'gql/queries'
import { useBreakGlassContext } from '../breakGlass.provider'
import { BreakGlassConfigType } from '../breakGlass.provider.type'

// TODO add parameters after merge to exclude ort query some sub
// SUB_QUERY, SUB_SKIP etc.
export const useBreakGlassConfigInit = () => {
  const { updateBreakGlassConfig } = useBreakGlassContext()
  const [storage, setStorage] = useState<Partial<BreakGlassConfigType>>({})

  const { loading: glassBrokenLoading } = useSubscription(GLASS_BROKEN_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage({ ...storage, break_glass: data.break_glass })
    },
  })
  const { loading: whiteListDevsLoading } = useSubscription(WHITE_LIST_DEVELOPERS_SUB, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data) setStorage({ ...storage, whitelist_developer: data.whitelist_developer })
    },
  })

  const isLoaded = !glassBrokenLoading && !whiteListDevsLoading

  useEffect(() => {
    if (isLoaded && storage.hasOwnProperty('break_glass') && storage.hasOwnProperty('whitelist_developer')) {
      updateBreakGlassConfig(storage as BreakGlassConfigType)
    }
  }, [isLoaded, storage, updateBreakGlassConfig])

  return { isLoading: !isLoaded }
}
