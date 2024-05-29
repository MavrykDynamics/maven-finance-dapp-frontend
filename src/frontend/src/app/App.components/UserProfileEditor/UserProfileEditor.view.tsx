import React, { useRef, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'

import { PopupContainer, PopupContainerWrapper } from '../popup/PopupMain.style'
import {
  UserProfileEditorStyled,
  UserProfileEditorRotate,
  UserProfileEditorZoom,
  UserProfileEditorSaveButton,
} from './UserProfileEditor.style'
import Icon from '../Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_ROUND, BUTTON_WIDE, BUTTON_THIRD } from '../Button/Button.constants'

const rotateSides = {
  LEFT: 'left',
  RIGHT: 'right',
}

type Props = {
  file: File | null
  getFile: (file: File) => void
  show: boolean
  closeEditor: () => void
}

export const UserProfileEditor = ({ file, getFile, show: showEditor, closeEditor }: Props) => {
  const [zoom, setZoom] = useState('1')
  const [rotate, setRotate] = useState('0')
  // TODO check avatar editor typ and class
  const editor = useRef<AvatarEditor | null>(null)

  const handleFile = async () => {
    if (editor.current) {
      const defaultFileName = 'user profile image'
      const dataUrl = editor.current.getImage().toDataURL()
      const preparedUrl = await fetch(dataUrl)
      const blob = await preparedUrl.blob()
      const editedFile = new File([blob], file?.name || defaultFileName)

      getFile(editedFile)
      setZoom('1')
      setRotate('0')
      closeEditor()
    }
  }

  function handleZoom(e: React.ChangeEvent<HTMLInputElement>) {
    // stylizes the background of input range up to slider thumb
    const target = e.target

    const min = Number(target.min)
    const max = Number(target.max)
    const val = Number(target.value)

    target.style.backgroundSize = ((val - min) * 100) / (max - min) + '% 100%'

    // set zoom
    setZoom(e.target.value)
  }

  const handleRotate = (side: string) => {
    if (rotateSides.LEFT === side) {
      const result = String(Number(rotate) - 90)
      setRotate(result)
    } else if (rotateSides.RIGHT === side) {
      const result = String(Number(rotate) + 90)
      setRotate(result)
    }
  }

  return (
    <PopupContainer onClick={closeEditor} $show={showEditor}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()}>
        <button onClick={closeEditor} className="close-modal" />
        <UserProfileEditorStyled>
          <div className="avatar">
            {/* @ts-ignore */}
            <AvatarEditor
              ref={editor}
              image={file || ''}
              width={120}
              height={120}
              border={20}
              borderRadius={60}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={Number(zoom)}
              rotate={Number(rotate)}
            />

            <UserProfileEditorRotate>
              <NewButton isThin kind={BUTTON_THIRD} form={BUTTON_ROUND} onClick={() => handleRotate(rotateSides.LEFT)}>
                <Icon id="rotate-left-outlined" />
              </NewButton>
              <NewButton isThin kind={BUTTON_THIRD} form={BUTTON_ROUND} onClick={() => handleRotate(rotateSides.RIGHT)}>
                <Icon id="rotate-right-outlined" />
              </NewButton>
            </UserProfileEditorRotate>
          </div>

          <UserProfileEditorZoom>
            <div className="setting-title">Zoom:</div>

            <div>
              <Icon id="minus" />

              <input defaultValue={zoom} onChange={handleZoom} type="range" min="1" max="3" step="0.1" />

              <Icon id="plus" />
            </div>
          </UserProfileEditorZoom>

          <UserProfileEditorSaveButton>
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={handleFile}>
              Save Photo
            </NewButton>
          </UserProfileEditorSaveButton>
        </UserProfileEditorStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
