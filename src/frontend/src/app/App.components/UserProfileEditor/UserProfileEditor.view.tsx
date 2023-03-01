import React, { useRef, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { PopupContainer, PopupContainerWrapper } from '../SettingsPopup/SettingsPopup.style'
import {
  UserProfileEditorStyled,
  UserProfileEditorRotate,
  UserProfileEditorZoom,
  UserProfileEditorSaveButton,
} from './UserProfileEditor.style'
import Icon from '../Icon/Icon.view'

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
  const editor = useRef<AvatarEditor | null>(null)

  const handleFile = async () => {
    if (editor.current) {
      const defaultFileName = 'user profile image'
      const dataUrl = editor.current.getImage().toDataURL()
      const preparedUrl = await fetch(dataUrl)
      const blob = await preparedUrl.blob()
      const editedFile = new File([blob], file?.name || defaultFileName)
      getFile(editedFile)
      closeEditor()
    }
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
    <PopupContainer onClick={closeEditor} show={showEditor}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()}>
        <UserProfileEditorStyled>
          <div className="avatar">
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
              <button onClick={() => handleRotate(rotateSides.LEFT)}>
                <Icon id="rotate-left-outlined" />
              </button>
              <button onClick={() => handleRotate(rotateSides.RIGHT)}>
                <Icon id="rotate-right-outlined" />
              </button>
            </UserProfileEditorRotate>
          </div>

          <div onClick={closeEditor}>
            <Icon className="close-btn" id="navigation-menu_close" />
          </div>

          <UserProfileEditorZoom>
            <label>Zoom:</label>

            <div>
              <Icon id="minus" />

              <input
                defaultValue={zoom}
                onChange={(e) => setZoom(e.target.value)}
                type="range"
                min="1"
                max="3"
                step="0.1"
              />

              <Icon id="plus" />
            </div>
          </UserProfileEditorZoom>

          <UserProfileEditorSaveButton>
            <button onClick={handleFile}>Save Photo</button>
          </UserProfileEditorSaveButton>
        </UserProfileEditorStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
