import { useRef, useState } from 'react'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'

// view
import { IPFSUploaderView } from './IPFSUploader.view'

// utils
import { isHexadecimalByteString } from '../../../utils/validatorFunctions'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export type IPFSUploaderTypeFile = 'document' | 'image'
type IPFSUploaderProps = {
  className?: string
  title?: string
  typeFile: IPFSUploaderTypeFile
  listNumber?: number
  disabled?: boolean
  imageIpfsUrl: string
  setIpfsImageUrl: (imageUrl: string) => void
  formInputStatus?: Record<string, unknown>
  setFormInputStatus?: (obj: Record<string, unknown>) => void
}

const projectId = process.env.REACT_APP_IPFS_PROJECT_ID
const projectSecret = process.env.REACT_APP_IPFS_API_KEY
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

export const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
})

export const IPFSUploader = ({
  title,
  listNumber,
  typeFile,
  disabled,
  imageIpfsUrl,
  setIpfsImageUrl,
  formInputStatus,
  setFormInputStatus,
  className,
}: IPFSUploaderProps) => {
  const { bug } = useToasterContext()
  const { canUseIpfs } = useDappConfigContext()

  const [isUploading, setIsUploading] = useState(false)
  const [imageOk, setImageOk] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    try {
      setIsUploading(true)
      const added = await ipfsClient.add(file)
      const image = `https://cloudflare-ipfs.com/ipfs/${added.path}`

      setIpfsImageUrl(image)
      setIsUploading(false)
    } catch (error) {
      if (error instanceof Error) {
        if (process.env.REACT_APP_ENV === 'dev') console.error(error)
        bug(error.message)
        setIsUploading(false)
      }
    }
  }

  const handleOnBlur = () => {
    const validityCheckResult = isHexadecimalByteString(imageIpfsUrl)
    setImageOk(validityCheckResult)
    if (setFormInputStatus) {
      setFormInputStatus({ ...formInputStatus, image: validityCheckResult ? 'success' : 'error' })
    }
  }

  const handleIconClick = () => {
    inputFile?.current?.click()
  }

  return (
    <IPFSUploaderView
      typeFile={typeFile}
      className={className}
      title={title}
      disabled={disabled || !canUseIpfs}
      listNumber={listNumber}
      imageIpfsUrl={imageIpfsUrl}
      setIpfsImageUrl={setIpfsImageUrl}
      imageOk={imageOk}
      isUploading={isUploading}
      inputFile={inputFile}
      handleUpload={handleUpload}
      handleIconClick={handleIconClick}
      onBlur={handleOnBlur}
    />
  )
}
