import React, { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageTwoFormProps, ProposalBytesType } from '../ProposalSybmittion.types'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CustomTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Input } from '../../../app/App.components/Input/NewInput'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'

// const
import { checkBytesPairExists, getBytesPairValidationStatus, PROPOSAL_BYTE } from '../ProposalSubmition.helpers'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { INPUT_MEDIUM, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { isValidLength } from 'utils/validatorFunctions'
import { isHexadecimal } from 'utils/validatorFunctions'

// styles
import {
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
  SubmitProposalBytes,
  SubmitProposalBytesPair,
  SubmitProposalGeneralData,
  SubmitProposalHeader,
} from '../ProposalSubmission.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { Info } from 'app/App.components/Info/Info.view'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_SIMPLE, BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'

// TODO: Update markup
// valid bytes text for testing: 05050505080508050805050505050505080505050507070017050505050508030b

export const StageTwoForm = ({
  proposalId,
  currentProposal: { proposalData = [], title, locked },
  currentProposalValidation,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageTwoFormProps) => {
  const { governancePhase, fee, successReward, proposalMetadataTitleMaxLength } = useSelector(
    (state: State) => state.governance.config,
  )
  const isProposalPeriod = governancePhase === 'PROPOSAL'

  // is no bytes pair on proposal change add empty pair on client
  useEffect(() => {
    if (!proposalData.some(checkBytesPairExists)) {
      handleCreateNewByte()
    }
  }, [proposalId])

  const handleOnChange = (byte: ProposalBytesType, text: string, type: string) => {
    // update input value
    updateLocalProposalData(
      {
        proposalData: proposalData.map((oldByte) =>
          oldByte.id === byte.id ? { ...oldByte, [type === 'title' ? 'title' : 'encoded_code']: text } : oldByte,
        ),
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
                    validTitle:
                      isValidLength(text, 1, proposalMetadataTitleMaxLength) &&
                      getBytesPairValidationStatus(text, 'validTitle') === INPUT_STATUS_SUCCESS
                        ? INPUT_STATUS_SUCCESS
                        : INPUT_STATUS_ERROR,
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
                      isHexadecimal(text) && getBytesPairValidationStatus(text, 'validBytes') === INPUT_STATUS_SUCCESS
                        ? INPUT_STATUS_SUCCESS
                        : INPUT_STATUS_ERROR,
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
      <SubmitProposalGeneralData>
        <div className="submitted-data">
          <div className="label">1 - Proposal Title</div>
          <div className="value">{title}</div>
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

      <Info
        type={INFO_DEFAULT}
        text={
          'Bytes are executed in FILO. If you want to change the order of execution of the bytes, drag the pair to thedesired position.'
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
          const { title = '', encoded_code = '' } = item
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
                  inputStatus: currentProposalValidation.title,
                  inputSize: INPUT_MEDIUM,
                }}
                inputProps={{
                  disabled: existInServer || locked,
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
              />

              <div className={`remove-byte ${!isProposalPeriod || locked ? 'disabled' : ''}`}>
                <CustomTooltip text="Delete bytes pair" className="tooltip">
                  <Button kind={BUTTON_SIMPLE} onClick={() => handleDeletePair(item.id)}>
                    <Icon id="delete" />
                  </Button>
                </CustomTooltip>
              </div>
            </SubmitProposalBytesPair>
          )
        })}
        <div className="add-byte">
          <CustomTooltip text="Add bytes pair" className="tooltip">
            <Button kind={BUTTON_SIMPLE_SMALL} disabled={!isProposalPeriod || locked} onClick={handleCreateNewByte}>
              <Icon id="plus" />
            </Button>
          </CustomTooltip>
        </div>
      </SubmitProposalBytes>
    </>
  )
}
