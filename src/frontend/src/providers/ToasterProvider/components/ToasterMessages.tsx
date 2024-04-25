import { useEffect, useState } from 'react'

import { sleep } from 'utils/api/sleep'
import { useToasterContext } from '../toaster.provider'
import { ToasterAnimationType, ToasterMessage } from '../toaster.provider.type'

import { ToasterContainer, ToasterContent, ToasterCountdown, ToasterIcon, ToasterStyled } from './Toaster.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

import Icon from 'app/App.components/Icon/Icon.view'
import {
  ANIMATION_DURATION,
  TOASTER_HIDE,
  TOASTER_LOADING,
  TOASTER_REVEAL,
  TOASTS_LIMIT,
  TOAST_ICON_MAPPER,
  TOAST_TIME_TO_LIVE,
} from '../toaster.provider.const'

const Toast = ({ toast }: { toast: ToasterMessage }) => {
  const [toastAnimation, setToastAnimation] = useState<ToasterAnimationType>(TOASTER_REVEAL)
  const { hideToasterMessage, deleteToasterFromArray } = useToasterContext()
  const { title, message, type, unique, hide } = toast

  // effect to update toast property "hide" to 'true' for playing hide animation
  useEffect(() => {
    if (type !== TOASTER_LOADING) {
      ;(async () => {
        await sleep(TOAST_TIME_TO_LIVE)
        hideToasterMessage(unique)
      })()
    }
  }, [hideToasterMessage, type, unique])

  // play hide animation and completely delete toast
  useEffect(() => {
    if (hide) {
      ;(async () => {
        setToastAnimation(TOASTER_HIDE)
        // wait for animation finish
        await sleep(ANIMATION_DURATION)
        deleteToasterFromArray(unique)
      })()
    }
  }, [deleteToasterFromArray, hide, unique])

  return (
    <ToasterStyled $animationType={toastAnimation} $delay={ANIMATION_DURATION} $distance={500}>
      <ToasterIcon $status={type}>
        {type === TOASTER_LOADING ? (
          <SpinnerCircleLoaderStyled className="toaster-loader" />
        ) : (
          <Icon id={TOAST_ICON_MAPPER[type]} />
        )}
      </ToasterIcon>

      <ToasterContent $status={type} lang="en">
        <div className="title">{title}</div>
        <div className="message">{message}</div>
      </ToasterContent>

      <ToasterCountdown $status={type} />
    </ToasterStyled>
  )
}

export const ToasterMessages = () => {
  const { messages, deleteToasterFromArray } = useToasterContext()

  // remove toasts starting from the oldest if messages limit was passed
  useEffect(() => {
    if (messages.length > TOASTS_LIMIT) {
      const messagesToRemoveCount = messages.length - TOASTS_LIMIT
      const _messages = messages.filter((m) => m.type !== TOASTER_LOADING)
      Array.from({ length: messagesToRemoveCount }).forEach((_, idx) => {
        if (!_messages[idx]) return
        deleteToasterFromArray(_messages[idx].unique)
      })
    }
  }, [messages, deleteToasterFromArray])

  if (!messages.length) return null

  return (
    <ToasterContainer>
      {messages.map((m) => (
        <Toast key={m.unique} toast={m} />
      ))}
    </ToasterContainer>
  )
}
