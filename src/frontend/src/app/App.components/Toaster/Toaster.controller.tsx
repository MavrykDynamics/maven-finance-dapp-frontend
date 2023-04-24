import { useSelector } from 'react-redux'

import { TOASTER_LOADING } from './Toaster.constants'
import { State } from 'reducers'

import Icon from '../Icon/Icon.view'
import { ToasterContent, ToasterCountdown, ToasterIcon, ToasterStyled } from './Toaster.style'
import { SpinnerCircleLoaderStyled } from '../Loader/Loader.style'
import { useEffect, useRef } from 'react'

export const Toaster = () => {
  const { status = '', title = '', message = '' } = useSelector((state: State) => state.toaster) ?? {}
  // need to store prev toaster data to show it when toaster disappears
  const prevToasterData = useRef({
    status: '',
    title: '',
    message: '',
  })

  // effect to track prev toaster data
  useEffect(() => {
    if (title !== '' && title !== prevToasterData.current.title) prevToasterData.current.title = title
    if (message !== '' && message !== prevToasterData.current.message) prevToasterData.current.message = message
    if (status !== '' && status !== prevToasterData.current.status) prevToasterData.current.status = status
  }, [status, message, title])

  // check whether to show toaster, and if yes show data from redux, if no it means we hide toaster and show prev data
  // means that redux data is null and ref data contain redux value before null
  const showingToaster = Boolean(status)
  const statusToUse = showingToaster ? status : prevToasterData.current.status
  const titleToUse = showingToaster ? title : prevToasterData.current.title
  const messageToUse = showingToaster ? message : prevToasterData.current.message

  return (
    <ToasterStyled showing={showingToaster}>
      <ToasterIcon status={statusToUse}>
        {statusToUse === TOASTER_LOADING ? (
          <SpinnerCircleLoaderStyled className="toaster-loader" />
        ) : (
          <Icon id={statusToUse} />
        )}
      </ToasterIcon>

      <ToasterContent status={statusToUse} lang="en">
        <div className="title">{titleToUse}</div>
        <div className="message">{messageToUse}</div>
      </ToasterContent>

      <ToasterCountdown showing={showingToaster} status={statusToUse} />
    </ToasterStyled>
  )
}
