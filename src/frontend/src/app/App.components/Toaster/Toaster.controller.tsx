import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { State } from 'reducers'
import Icon from '../Icon/Icon.view'

import { hideToaster } from './Toaster.actions'

import {
  ToasterClose,
  ToasterContent,
  ToasterCountdown,
  ToasterGrid,
  ToasterIcon,
  ToasterMessage,
  ToasterStyled,
  ToasterTitle,
} from './Toaster.style'

// TODO: ectract to the React.context
export const Toaster = () => {
  const dispatch = useDispatch()
  const toaster = useSelector((state: State) => state.toaster)
  const { status = '', title = '', message = '' } = toaster ?? {}
  const showingToaster = Boolean(toaster)

  const closeCallback = () => {
    dispatch(hideToaster())
  }

  return (
    <ToasterStyled showing={Boolean(showingToaster)}>
      <ToasterGrid>
        <ToasterIcon status={status}>
          <Icon id={status} />
        </ToasterIcon>
        <ToasterContent lang="en">
          <ToasterTitle>{title}</ToasterTitle>
          <ToasterMessage>{message}</ToasterMessage>
        </ToasterContent>
        <ToasterClose onClick={closeCallback}>
          <Icon id={'close'} />
        </ToasterClose>
      </ToasterGrid>
      <ToasterCountdown showing={Boolean(showingToaster)} status={status} />
    </ToasterStyled>
  )
}
