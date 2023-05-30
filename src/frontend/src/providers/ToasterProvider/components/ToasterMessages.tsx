import React, { useEffect, useState } from 'react'
import { useToasterContext } from '../toaster.provider'
import { ToasterContainer, ToasterContent, ToasterCountdown, ToasterIcon, ToasterStyled } from './Toaster.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import Icon from 'app/App.components/Icon/Icon.view'
import { ToasterMessage } from '../toaster.provider.type'
import {
  ANIMATION_DURATION,
  TOASTER_LOADING,
  TOASTS_LIMIT,
  TOAST_ICON_MAPPER,
  TOAST_TIME_TO_LIVE,
} from '../toaster.provider.const'
import classNames from 'classnames'
import { sleep } from 'utils/api/sleep'

const Toast = ({ toast }: { toast: ToasterMessage }) => {
  const [toastAnimation, setToastAnimation] = useState('reveal')
  const { removeToasterMessage } = useToasterContext()
  const { title, message, type, unique } = toast

  useEffect(() => {
    if (type !== TOASTER_LOADING) {
      ;(async () => {
        await sleep(TOAST_TIME_TO_LIVE)
        setToastAnimation('hide')
        // wait for animation finish
        await sleep(ANIMATION_DURATION)
        removeToasterMessage(unique)
      })()
    }
  }, [removeToasterMessage, type, unique])

  return (
    <ToasterStyled
      className={classNames({
        hide: toastAnimation === 'hide',
        reveal: toastAnimation === 'reveal',
      })}
    >
      <ToasterIcon status={type}>
        {type === TOASTER_LOADING ? (
          <SpinnerCircleLoaderStyled className="toaster-loader" />
        ) : (
          <Icon id={TOAST_ICON_MAPPER[type]} />
        )}
      </ToasterIcon>

      <ToasterContent status={type} lang="en">
        <div className="title">{title}</div>
        <div className="message">{message}</div>
      </ToasterContent>

      <ToasterCountdown status={type} />
    </ToasterStyled>
  )
}

export const ToasterMessages = () => {
  const { messages, removeToasterMessage } = useToasterContext()

  // remove toasts starting from the oldest if messages limit was passed
  useEffect(() => {
    if (messages.length > TOASTS_LIMIT) {
      const messagesToRemoveCount = messages.length - TOASTS_LIMIT
      for (let i = 0; i < messagesToRemoveCount; i++) {
        removeToasterMessage(messages[i].unique)
      }
    }
  }, [messages, removeToasterMessage])

  if (!messages.length) return null

  return (
    <ToasterContainer delay={ANIMATION_DURATION} distance={500}>
      {messages.map((m) => (
        <Toast key={m.unique} toast={m} />
      ))}
    </ToasterContainer>
  )
}
