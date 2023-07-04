import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { ErrorPageRouter } from 'providers/ToasterProvider/toaster.provider.const'
import React, { useEffect } from 'react'

export const RenderErrorPage = () => {
  const { setErrorType } = useToasterContext()

  useEffect(() => {
    setErrorType(ErrorPageRouter)
  }, [])

  return <></>
}
