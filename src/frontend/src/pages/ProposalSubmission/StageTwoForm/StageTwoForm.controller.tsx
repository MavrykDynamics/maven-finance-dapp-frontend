import React, { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageTwoFormProps, ProposalBytesType } from '../ProposalSubmission.types'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CustomTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Input } from '../../../app/App.components/Input/NewInput'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import Button from 'app/App.components/Button/NewButton'
import { Info } from 'app/App.components/Info/Info.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// const, helpers
import { checkBytesPairExists, getBytesPairValidationStatus, PROPOSAL_BYTE } from '../ProposalSubmission.helpers'
import { STAGE_2_DESCRIPTION } from 'texts/tooltips/governance'
import { INPUT_MEDIUM, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { INFO_DEFAULT, INFO_WARNING } from 'app/App.components/Info/info.constants'
import { BUTTON_SIMPLE, BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { isHexadecimal } from 'utils/validatorFunctions'

// styles
import { SubmitProposalBytes, SubmitProposalBytesPair, SubmitProposalGeneralData } from '../ProposalSubmission.style'

// valid bytes text for testing: 0502000000c703200743036e0a000000160136047207da50aa1f751393d670b8810457c21d43000655076504620000001525757064617465436f6e6669674e657756616c75650864046c0000001925636f6e6669675661756c744e616d654d61784c656e677468046c0000000625656d7074790000001325757064617465436f6e666967416374696f6e0000000d25757064617465436f6e666967072f0200000008074303620000032702000000000743036a0000034f0533036c0743036200140342034d053d036d034c031b
export const StageTwoForm = ({
  proposalId,
  currentProposal: { proposalData = [], title, locked },
  currentProposalValidation,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageTwoFormProps) => {
  const {
    governancePhase,
    fee,
    successReward,
    proposalMetadataTitleMaxLength,
    proposalDescriptionMaxLength,
    proposalSourceCodeMaxLength,
  } = useSelector((state: State) => state.governance.config)
  const isProposalPeriod = governancePhase === 'PROPOSAL'

  // is no bytes pair on proposal change add empty pair on client
  useEffect(() => {
    if (!proposalData.some(checkBytesPairExists) && !locked) {
      handleCreateNewByte()
    }
  }, [proposalId, locked])

  const handleOnChange = (byte: ProposalBytesType, text: string, type: string) => {
    // update input value
    updateLocalProposalData(
      {
        proposalData: proposalData.map((oldByte) => (oldByte.id === byte.id ? { ...oldByte, [type]: text } : oldByte)),
      },
      proposalId,
    )

    // update validation for input
    switch (type) {
      case 'title':
        updateLocalProposalValidation(
          {
            bytesValidation: currentProposalValidation.bytesValidation.map((byteValidity) =>
              byteValidity.byteId === byte.id
                ? {
                    ...byteValidity,
                    validTitle: getBytesPairValidationStatus(text, proposalMetadataTitleMaxLength),
                  }
                : byteValidity,
            ),
          },
          proposalId,
        )
        break
      case 'encoded_code':
        updateLocalProposalValidation(
          {
            bytesValidation: currentProposalValidation.bytesValidation.map((byteValidity) =>
              byteValidity.byteId === byte.id
                ? {
                    ...byteValidity,
                    validBytes:
                      isHexadecimal(text) &&
                      getBytesPairValidationStatus(text, proposalSourceCodeMaxLength) === INPUT_STATUS_SUCCESS
                        ? INPUT_STATUS_SUCCESS
                        : INPUT_STATUS_ERROR,
                  }
                : byteValidity,
            ),
          },
          proposalId,
        )
        break
      case 'code_description':
        updateLocalProposalValidation(
          {
            bytesValidation: currentProposalValidation.bytesValidation.map((byteValidity) =>
              byteValidity.byteId === byte.id
                ? {
                    ...byteValidity,
                    validDescr: getBytesPairValidationStatus(text, proposalDescriptionMaxLength),
                  }
                : byteValidity,
            ),
          },
          proposalId,
        )
        break
    }
  }

  // adding new empty bytes pair
  const handleCreateNewByte = () => {
    const newId = Date.now()
    const newOrder = Math.max(...proposalData.map(({ order }) => order), 0) + 1
    // add bytes pair to actual proposal data to display it to user
    updateLocalProposalData(
      {
        proposalData: [
          ...proposalData,
          {
            ...PROPOSAL_BYTE,
            id: newId,
            order: newOrder,
          },
        ],
      },
      proposalId,
    )
    // add validation field for new bytes pair
    updateLocalProposalValidation(
      {
        bytesValidation: (currentProposalValidation.bytesValidation ?? []).concat({
          validBytes: '',
          validTitle: '',
          validDescr: '',
          byteId: newId,
        }),
      },
      proposalId,
    )
  }

  // removing bytes pair
  const handleDeletePair = (removeId: number) => {
    const pairToRemove = proposalData.find(({ id }) => removeId === id)

    if (pairToRemove) {
      updateLocalProposalData(
        {
          proposalData: proposalData.filter(({ id }) => id !== removeId),
        },
        proposalId,
      )
      updateLocalProposalValidation(
        {
          bytesValidation: currentProposalValidation.bytesValidation.filter(({ byteId }) => byteId !== removeId),
        },
        proposalId,
      )
    }
  }

  // Drag & drop variables and event handlers
  const [dndBytes, setdndBytes] = useState<Array<ProposalBytesType>>([])
  const [DnDSelectedProposal, setDnDSeletedProposal] = useState<ProposalBytesType | null>(null)
  const isDraggable = useMemo(() => proposalData?.length > 1, [proposalData])

  useEffect(() => {
    setdndBytes(proposalData)
  }, [proposalData])

  // handling changing order of elements on drop event
  const dropHandler = (e: React.DragEvent<HTMLElement>, byteToDrop: ProposalBytesType) => {
    e.preventDefault()
    if (DnDSelectedProposal) {
      // reordered and saved client bytes that user sees
      const updatedBytes = proposalData
        .map((byte) => {
          if (byte.id === byteToDrop.id) {
            return { ...byte, order: Number(DnDSelectedProposal?.order) }
          }

          if (byte.id === DnDSelectedProposal?.id) {
            return { ...byte, order: byteToDrop.order }
          }

          return byte
        })
        .sort((a, b) => a.order - b.order)

      setdndBytes(updatedBytes)

      updateLocalProposalData(
        {
          proposalData: updatedBytes,
        },
        proposalId,
      )
    }
  }

  // removing classNames for under grad event cards
  const dragRemoveStyling = () => {
    setdndBytes(
      dndBytes.map((byte) => ({
        ...byte,
        isUnderTheDrop: false,
      })),
    )
  }

  // selecting card to drag
  const dragStartHandler = (byte: ProposalBytesType) => {
    setDnDSeletedProposal(byte)
  }

  // adding class names to under drag cards
  const dragOverHandler = (e: React.DragEvent<HTMLElement>, bytePairId: number) => {
    e.preventDefault()
    setdndBytes(
      dndBytes.map((byte) => ({
        ...byte,
        ...(bytePairId === byte.id && byte.id !== DnDSelectedProposal?.id ? { isUnderTheDrop: true } : {}),
      })),
    )
  }

  return (
    <>
      <div className="stage-descr">{STAGE_2_DESCRIPTION}</div>

      <SubmitProposalGeneralData>
        <div className="submitted-data">
          <div className="label">1 - Proposal Title</div>
          <div className="value">{title || '–'}</div>
        </div>

        <div className="submitted-data">
          <div className="label">2 - Proposal Success Reward</div>
          <CommaNumber className="value" value={successReward} endingText="MVK" />
        </div>

        <div className="submitted-data">
          <div className="label">3 - Fee</div>
          <CommaNumber className="value" value={fee} endingText="XTZ" />
        </div>
      </SubmitProposalGeneralData>

      <div className="bytes-label label">4 - Enter Proposal Bytes</div>

      <Info
        type={INFO_DEFAULT}
        text={
          <>
            Bytes are executed in FILO. If you want to change the order of execution of the bytes, drag the pair to the
            desired position. Learn more on how to create bytes for governance proposals in the{' '}
            <a href="https://www.npmjs.com/package/@mavrykdynamics/create-lambda-bytes">Mavryk Docs</a>.
          </>
        }
      />

      <SubmitProposalBytes>
        {dndBytes.map((item, i) => {
          if (
            !checkBytesPairExists(item) ||
            !item ||
            typeof item.title !== 'string' ||
            typeof item.encoded_code !== 'string'
          )
            return null
          const { title = '', encoded_code = '', code_description } = item
          const existInServer = Boolean(proposalData?.find(({ id }) => item.id === id && !item.isLocalBytes))
          const validityObject = currentProposalValidation.bytesValidation?.find(({ byteId }) => byteId === item.id)

          return (
            <SubmitProposalBytesPair
              key={item.id}
              className={`${isDraggable ? 'draggabe' : ''} ${item.isUnderTheDrop ? 'underDrop' : ''}`}
              draggable={isDraggable}
              onDragLeave={dragRemoveStyling}
              onDragEnd={dragRemoveStyling}
              onDragStart={() => dragStartHandler(item)}
              onDragOver={(e) => dragOverHandler(e, item.id)}
              onDrop={(e) => dropHandler(e, item)}
            >
              <div className="idx">{i + 1}</div>

              <Input
                settings={{
                  label: 'Enter Proposal Bytes Title',
                  inputStatus: validityObject?.validTitle,
                  inputSize: INPUT_MEDIUM,
                }}
                inputProps={{
                  disabled: existInServer || locked || !isProposalPeriod,
                  value: title,
                  type: 'text',
                  name: 'title',
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    handleOnChange(item, e.target.value, e.target.name),
                }}
              />

              <TextArea
                name="encoded_code"
                label="Enter Proposal Bytes Data"
                value={encoded_code}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleOnChange(item, e.target.value, e.target.name)
                }
                inputStatus={validityObject?.validBytes}
                disabled={!isProposalPeriod || locked}
                textAreaMaxLimit={proposalSourceCodeMaxLength}
              />

              <TextArea
                name="code_description"
                label="Enter Proposal Bytes Description"
                value={code_description ?? ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleOnChange(item, e.target.value, e.target.name)
                }
                inputStatus={validityObject?.validDescr}
                disabled={!isProposalPeriod || locked}
                textAreaMaxLimit={proposalDescriptionMaxLength}
              />

              <div className={`remove-byte ${!isProposalPeriod || locked ? 'disabled' : ''}`}>
                <CustomTooltip text="Delete bytes pair" className="tooltip">
                  <Button
                    kind={BUTTON_SIMPLE}
                    onClick={() => handleDeletePair(item.id)}
                    disabled={!isProposalPeriod || locked}
                  >
                    <Icon id="delete" />
                  </Button>
                </CustomTooltip>
              </div>
            </SubmitProposalBytesPair>
          )
        })}

        {dndBytes.length >= 5 ? (
          <div className="bytes-restriction-banner">
            <Info
              text={
                'If you are adding a heavy load of bytes, such as bytes to create 20 farms, note that this can cause the operation size can be too large to execute successfully. We suggest to only create farms in batches of 5 per proposal'
              }
              type={INFO_WARNING}
            />
          </div>
        ) : null}

        <div className={`add-byte ${!isProposalPeriod || locked ? 'disabled' : ''}`}>
          <CustomTooltip text="Add bytes pair" className="tooltip">
            <Button kind={BUTTON_SIMPLE_SMALL} disabled={!isProposalPeriod || locked} onClick={handleCreateNewByte}>
              <Icon id="plus" /> Add New Bytes
            </Button>
          </CustomTooltip>
        </div>
      </SubmitProposalBytes>
    </>
  )
}
