import React, { useContext } from 'react'
import { ErrorPage } from 'pages/Error/ErrorPage'

// types
import type { ToasterContextType, ToasterTypes } from './toaster.provider.type'
import type { CustomErrors } from '../../errors/error'

// consts
import {
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_WARNING,
  errorDescDefaultText,
  errorDescDefaultTextWhenError,
  errorHeaderDefaultText,
  errorHeaderDefaultTextWhenError,
} from './toaster.provider.const'
import { generateUniqueId } from 'utils/calcFunctions'

export const toasterContext = React.createContext<ToasterContextType>(undefined!)

// TODO add 404 page for critical errors
type Props = {
  children: React.ReactNode
  error?: CustomErrors
  pageNotFound?: JSX.Element
}

type State = {
  context: ToasterContextType
}

/**
 *
 */
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
        hideToasterMessage: this.hideToasterMessage,
        deleteToasterFromArray: this.deleteToasterFromArray,
        messages: [],
        setError: this.setError,
        is404PageInView: false,
        setIs404PageInView: this.setIs404PageInView,
      },
    }
  }

  /**
   *
   * @param error
   */
  componentDidCatch(error: Error): void {
    this.addToasterMessage('', error.message, TOASTER_ERROR)
  }

  addToasterMessage = (title: string, message: string, type: ToasterTypes): string => {
    const unique = generateUniqueId()
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        messages: prevState.context.messages.concat([
          {
            type,
            title,
            message,
            unique,
            hide: false,
          },
        ]),
      },
    }))

    return unique
  }

  bug = (rawError: Error | string, title = ''): string => {
    if (rawError instanceof Error) {
      console.warn(rawError.message)
      return this.addToasterMessage(title, rawError.message, TOASTER_ERROR)
    } else {
      console.warn(rawError)
      return this.addToasterMessage(title, rawError, TOASTER_ERROR)
    }
  }

  fatal = (error: CustomErrors): void => {
    this.setError(error)
    console.error(error)
  }

  success = (title: string, message: string): string => {
    return this.addToasterMessage(title, message, TOASTER_SUCCESS)
  }

  info = (title: string, message: string): string => {
    return this.addToasterMessage(title, message, TOASTER_INFO)
  }

  warning = (title: string, message: string): string => {
    console.warn(message)
    return this.addToasterMessage(title, message, TOASTER_WARNING)
  }

  loading = (title: string, message: string): string => {
    return this.addToasterMessage(title, message, TOASTER_LOADING)
  }

  setError = (error: CustomErrors): void => {
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        error,
      },
    }))
  }

  /**
   * sets hide property for toast to 'true' to play hide animation
   * @param unique toaster id
   */
  hideToasterMessage = (unique: string): void => {
    const { messages } = this.state.context
    const message = messages.find((m) => m.unique === unique)

    if (!message) return

    const hidedMessage = { ...message, hide: true }

    const _messages = messages.map((m) => {
      if (m.unique === unique) {
        return hidedMessage
      }
      return m
    })

    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        messages: _messages,
      },
    }))
  }

  /**
   * completely deletes toast from messages
   * should be used only within ToasterMessages component
   * @param unique toast id
   */
  deleteToasterFromArray = (unique: string): void => {
    const { messages } = this.state.context

    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        messages: messages.filter((m) => m.unique !== unique),
      },
    }))
  }

  setIs404PageInView = (value = true) => {
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        is404PageInView: value,
      },
    }))
  }

  /**
   *
   */
  render(): JSX.Element {
    // add 404 page when isCritical error
    const isCritical = Boolean(this.state.context.error)

    console.log(isCritical, 'isCritical')

    // TODO replace with real error message
    const headerText = isCritical ? errorHeaderDefaultTextWhenError : errorHeaderDefaultText
    const descText = isCritical ? errorDescDefaultTextWhenError : errorDescDefaultText

    return (
      <toasterContext.Provider value={this.state.context}>
        {isCritical ? <ErrorPage headerText={headerText} descText={descText} /> : this.props.children}
      </toasterContext.Provider>
    )
  }
}

export const useToasterContext = () => useContext(toasterContext)
