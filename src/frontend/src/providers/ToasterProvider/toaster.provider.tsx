import React, { useContext } from 'react'

// types
import type { ToasterContextType, ToasterTypes } from './toaster.provider.type'
import type { Errors } from '../../errors/error'

// consts
import {
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_WARNING,
} from './toaster.provider.const'

export const toasterContext = React.createContext<ToasterContextType>(undefined!)

type Props = {
  children: React.ReactNode
  error?: Errors
  pageNotFound?: JSX.Element
}

type State = {
  context: ToasterContextType
}

export default class ToasterProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        bug: this.bug,
        info: this.info,
        warning: this.warning,
        fatal: this.fatal,
        success: this.success,
        loading: this.loading,
        error: props.error || null,
        removeToasterMessage: this.removeToasterMessage,
        messages: [],
        setError: this.setError,
      },
    }
  }

  componentDidCatch(error: Error): void {
    this.addToasterMessage('', error.message, TOASTER_ERROR)
  }

  addToasterMessage = (title: string, message: string, type: ToasterTypes): void => {
    const { messages } = this.state.context
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        messages: messages.concat([
          {
            type,
            title,
            message,
            unique: Math.random().toString(36).substring(2) + Date.now().toString(36),
          },
        ]),
      },
    }))
  }

  bug = (rawError: Error | string, title = ''): void => {
    if (rawError instanceof Error) {
      console.warn(rawError.message)
      this.addToasterMessage(title, rawError.message, TOASTER_ERROR)
    } else {
      console.warn(rawError)
      this.addToasterMessage(title, rawError, TOASTER_ERROR)
    }
  }

  fatal = (error: Errors): void => {
    this.setError(error)
    console.error(error)
  }

  success = (title: string, message: string): void => {
    this.addToasterMessage(title, message, TOASTER_SUCCESS)
  }

  info = (title: string, message: string): void => {
    console.info(message)
    this.addToasterMessage(title, message, TOASTER_INFO)
  }

  warning = (title: string, message: string): void => {
    console.warn(message)
    this.addToasterMessage(title, message, TOASTER_WARNING)
  }

  loading = (title: string, message: string): void => {
    console.warn(message)
    this.addToasterMessage(title, message, TOASTER_LOADING)
  }

  setError = (error: Errors): void => {
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        error,
      },
    }))
  }

  removeToasterMessage = (unique: string): void => {
    const { messages } = this.state.context

    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        messages: messages.filter((message) => unique !== message.unique),
      },
    }))
  }

  render(): JSX.Element {
    // add 404 page when isCritical error
    return <toasterContext.Provider value={this.state.context}>{this.props.children}</toasterContext.Provider>
  }
}

export const useToasterContext = () => useContext(toasterContext)
