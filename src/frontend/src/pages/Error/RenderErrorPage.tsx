import { FatalError } from 'errors/error'
import { ERROR_TYPE_ROUTER } from 'errors/error.const'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import React, { useEffect } from 'react'

export const RenderErrorPage = () => {
  const { setError } = useToasterContext()

  useEffect(() => {
    setError(new FatalError('Router error', {}, ERROR_TYPE_ROUTER))
  }, [])

  return <></>
}
