import { useSelector } from 'react-redux'

import { TOASTER_LOADING } from './Toaster.constants'
import { State } from 'reducers'

import Icon from '../Icon/Icon.view'
import { ToasterContent, ToasterCountdown, ToasterIcon, ToasterStyled } from './Toaster.style'
import { SpinnerCircleLoaderStyled } from '../Loader/Loader.style'

export const Toaster = () => {
  const { status = '', title = '', message = '' } = useSelector((state: State) => state.toaster) ?? {}
  const showingToaster = Boolean(status)

  return (
    <ToasterStyled showing={showingToaster}>
      <ToasterIcon status={status}>
        {status === TOASTER_LOADING ? <SpinnerCircleLoaderStyled className="toaster-loader" /> : <Icon id={status} />}
      </ToasterIcon>

      <ToasterContent status={status} lang="en">
        <div className="title">{title}</div>
        <div className="message">{message}</div>
      </ToasterContent>

      <ToasterCountdown showing={showingToaster} status={status} />
    </ToasterStyled>
  )
}
