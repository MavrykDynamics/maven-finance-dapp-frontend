import React, { Ref, useCallback, useState } from 'react'

// types
import type { IPFSUploaderTypeFile } from './IPFSUploader.controller'

// view
import Icon from '../Icon/Icon.view'
import { ImageWithPlug } from '../Icon/ImageWithPlug'
import { UserProfileEditor } from '../UserProfileEditor/UserProfileEditor.view'
import {
  IpfsUploadedImageContainer,
  IPFSUploaderStyled,
  UploaderFileSelector,
  UploadIconContainer,
} from './IPFSUploader.style'

// consts
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from '../Input/Input.constants'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

type IPFSUploaderViewProps = {
  title?: string
  typeFile: IPFSUploaderTypeFile
  listNumber?: number
  imageIpfsUrl: string
  setIpfsImageUrl: (imageUrl: string) => void
  imageOk: boolean
  disabled?: boolean
  isUploading: boolean
  inputFile: Ref<HTMLInputElement>
  handleUpload: (file: File) => void
  handleIconClick: () => void
  onBlur: () => void
  className?: string
}

const IMG_MAX_SIZE = 1

export const IPFSUploaderView = ({
  title,
  typeFile,
  listNumber,
  imageIpfsUrl,
  setIpfsImageUrl,
  isUploading,
  inputFile,
  disabled,
  handleUpload,
  handleIconClick,
  onBlur,
  className,
}: IPFSUploaderViewProps) => {
  const { info } = useToasterContext()

  const [uploadIsFailed, setUploadIsFailed] = useState(false)
  const [isDocument, setIsDocument] = useState(false)
  const [fileName, setFileName] = useState('')
  const isTypeFileImage = typeFile === 'image'
  const [validationStatus, setValidationStatus] = useState<InputStatusType>(imageIpfsUrl ? INPUT_STATUS_SUCCESS : '')

  const [file, setFile] = useState<File | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const uploadedFile = e.target.files[0]
    const fileSize = uploadedFile?.size / 1024 / 1024 // in MiB
    const { name } = uploadedFile

    if (fileSize <= IMG_MAX_SIZE) {
      setUploadIsFailed(false)
      setValidationStatus(INPUT_STATUS_SUCCESS)
      setFile(uploadedFile)
    } else {
      setUploadIsFailed(true)
      setValidationStatus(INPUT_STATUS_ERROR)
      info('File is too big!', `Max size is ${IMG_MAX_SIZE}MB`)
    }

    // check file type
    if (uploadedFile?.type.toLowerCase().includes('pdf')) {
      setIsDocument(true)
      setFileName(name)
    } else {
      setIsDocument(false)
    }
  }, [])

  const handleDelete = () => {
    setUploadIsFailed(false)
    setIsDocument(false)
    setFileName('')
    setIpfsImageUrl('')
    setFile(null)
  }

  const handleCloseEditor = () => {
    setFile(null)
  }

  return (
    <IPFSUploaderStyled className={className} id={'ipfsUploaderContainer'}>
      <div style={{ opacity: disabled ? 0.6 : 1 }}>
        {title && (
          <label>
            {listNumber ? `${listNumber} - ` : null}
            {title}
          </label>
        )}
        <UploaderFileSelector
          $validation={validationStatus ?? ''}
          className={`${disabled ? 'disabled' : ''} ${validationStatus}`}
        >
          <div>
            <input
              value=""
              id="uploader"
              type="file"
              disabled={disabled || isUploading}
              accept={`.jpeg, .png, ${isTypeFileImage ? '' : '.pdf'}`}
              ref={inputFile}
              onChange={handleChange}
              onBlur={onBlur}
            />

            <UserProfileEditor
              file={file}
              getFile={handleUpload}
              show={Boolean(file)}
              closeEditor={handleCloseEditor}
            />

            <UploadIconContainer $uploadIsFailed={uploadIsFailed} onClick={handleIconClick}>
              {imageIpfsUrl && !isUploading ? (
                <>
                  {isDocument ? (
                    <figure className="upload-figure">
                      <div className="icon-wrap">
                        <Icon className="upload-icon" id="upload" />
                      </div>
                      <figcaption>{fileName}</figcaption>
                      <small></small>
                    </figure>
                  ) : (
                    <IpfsUploadedImageContainer>
                      <ImageWithPlug alt={'uploaded image'} imageLink={imageIpfsUrl} />
                      <div className="pencil-wrap">
                        <Icon id="pencil-stroke" />
                      </div>
                    </IpfsUploadedImageContainer>
                  )}
                </>
              ) : (
                <figure className="upload-figure">
                  <div className="icon-wrap">
                    {isUploading ? (
                      <img className="loading-icon" src="/icons/loading-white.svg" alt="loading" />
                    ) : (
                      <Icon className="upload-icon" id="upload" />
                    )}
                  </div>
                  <figcaption>Upload {isTypeFileImage ? 'picture' : 'document'}</figcaption>
                  <small className="tip">{`Supports: PNG. JPG. ${
                    isTypeFileImage ? '' : 'PDF.'
                  } Max size is ${IMG_MAX_SIZE}MB`}</small>
                </figure>
              )}
            </UploadIconContainer>
            {Boolean(imageIpfsUrl && !isUploading) ? (
              <div onClick={handleDelete}>
                <Icon className="delete-icon" id="delete" />
              </div>
            ) : null}
          </div>
        </UploaderFileSelector>
      </div>
    </IPFSUploaderStyled>
  )
}
