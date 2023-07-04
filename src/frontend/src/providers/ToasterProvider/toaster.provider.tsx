import React, { useContext } from 'react'
import { ErrorPage } from 'pages/Error/ErrorPage'

// types
import type { ErrorPageType, ToasterContextType, ToasterTypes } from './toaster.provider.type'
import type { CustomErrors } from '../../errors/error'

// consts
import {
  ErrorPageFatal,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_WARNING,
} from './toaster.provider.const'
import { generateUniqueId } from 'utils/calcFunctions'
import { getErrorPageData } from './helpers/getErrorPageData'

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
        error: props.error || null, // fatal error
        errorType: null, // router | fatal - to know which text to show on ErrorPage
        setErrorType: this.setErrorType,
        hideToasterMessage: this.hideToasterMessage,
        deleteToasterFromArray: this.deleteToasterFromArray,
        messages: [],
        setError: this.setError,
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
    this.setErrorType(ErrorPageFatal)
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
  setErrorType = (type: ErrorPageType): void => {
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        errorType: type,
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

  /**
   *
   */
  render(): JSX.Element {
    const showErrorPage = this.state.context.errorType !== null
    const { header, desc } = getErrorPageData(this.state.context.errorType)

    return (
      <toasterContext.Provider value={this.state.context}>
        {showErrorPage ? <ErrorPage headerText={header} descText={desc} /> : this.props.children}
      </toasterContext.Provider>
    )
  }
}

export const useToasterContext = () => useContext(toasterContext)
