import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { defaultProposalMetadataTitleMaxLength } from 'providers/DappConfigProvider/helpers/dappConfig.const'
import { isValidLength, validateTzAddress } from 'utils/validatorFunctions'

import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { StageThreeValidityItem, ProposalValidityObj } from '../ProposalSubmission.types'

// VALIDATION FN'S TODO: add some checking in future (no cond for it now)
export const getBytesPairValidationStatus = (
  newText: string,
  maxLength?: number,
): typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR => {
  const isValidMaxLength = maxLength ? isValidLength(newText, 1, maxLength) : true

  return Boolean(newText) && isValidMaxLength ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
}

export const getValidityStageThreeTable = (
  valueName: StageThreeValidityItem,
  value: string | number,
  options?: { tokenBalance?: number; maxLength?: number },
): boolean => {
  switch (valueName) {
    case 'token_amount':
      return Number(value) > 0 && (options?.tokenBalance ? Number(value) <= options.tokenBalance : true)
    case 'to__id':
      return validateTzAddress(value as string)
    case 'title':
      return isValidLength(value as string, 1, options?.maxLength ?? defaultProposalMetadataTitleMaxLength)
  }
}

export const isProposalHasChange = ({
  clientProposal,
  remoteProposal,
}: {
  clientProposal: ProposalRecordType | null
  remoteProposal: ProposalRecordType | null
}): boolean => {
  const isTitleDiff = clientProposal?.title !== remoteProposal?.title,
    isDescrDiff = clientProposal?.description !== remoteProposal?.description,
    isSourceLinkDiff = clientProposal?.sourceCode !== remoteProposal?.sourceCode

  // check only not empty bytes, skip empty ones
  const filteredBytes = clientProposal?.proposalData.filter(
    ({ title, encoded_code, code_description }) => title || encoded_code || code_description,
  )
  // Need to filter remote bytes, cuz when we remowe byte pair backend sets its encoded_code to null
  const filteredRemoteBytes = remoteProposal?.proposalData.filter(({ encoded_code }) => encoded_code)

  const isBytesDiff = Boolean(
    // if both are empty then there are no changes, need this cond to make every work valid
    filteredBytes?.length === 0 && filteredRemoteBytes?.length === 0
      ? false
      : // if they has different legth then they have changed
      filteredBytes?.length !== filteredRemoteBytes?.length
      ? true
      : // Compare every title and byte code to see whether they are eaqual
        filteredBytes?.some(({ title, encoded_code, code_description, id }, idx) => {
          const remoteProposalByte = filteredRemoteBytes?.[idx]
          return (
            title !== remoteProposalByte?.title ||
            encoded_code !== remoteProposalByte?.encoded_code ||
            code_description !== remoteProposalByte?.code_description ||
            id !== remoteProposalByte?.id
          )
        }),
  )

  // check only not empty payments, skip empty ones
  const filteredPayments = clientProposal?.proposalPayments.filter(({ token_amount, to__id }) => token_amount || to__id)
  // Need to filter remote payments, cuz when we remowe payment backend sets it to nullable values
  const filteredRemotePayments = remoteProposal?.proposalPayments.filter(
    ({ token_amount, to__id }) => token_amount || to__id,
  )

  const isPaymentsDiff = Boolean(
    // if both are empty then there are no changes, need this cond to make every work valid
    filteredPayments?.length === 0 && filteredRemotePayments?.length === 0
      ? false
      : // if they has different legth then they have changed
      filteredPayments?.length !== filteredRemotePayments?.length
      ? true
      : // Compare every receiver address, tokens amount, token adress to see whether they are eaqual
        filteredPayments?.some(({ token_amount, token_address, to__id, id }, idx) => {
          const remoteProposalPayment = filteredRemotePayments?.[idx]

          return (
            to__id !== remoteProposalPayment?.to__id ||
            token_amount !== remoteProposalPayment?.token_amount ||
            token_address !== remoteProposalPayment?.token_address ||
            id !== remoteProposalPayment?.id
          )
        }),
  )

  return isTitleDiff || isDescrDiff || isSourceLinkDiff || isBytesDiff || isPaymentsDiff
}

export const checkStage1Validation = ({
  proposalValidation,
}: {
  proposalValidation: ProposalValidityObj | null
}): boolean => {
  const { description, title, sourceCode, invoice } = proposalValidation ?? {}
  return (
    description === INPUT_STATUS_SUCCESS &&
    title === INPUT_STATUS_SUCCESS &&
    sourceCode === INPUT_STATUS_SUCCESS &&
    invoice !== INPUT_STATUS_ERROR
  )
}

export const checkStage2Validation = ({
  proposalValidation,
  currentProposal,
  remoteProposal,
}: {
  proposalValidation: ProposalValidityObj | null
  currentProposal: ProposalRecordType | null
  remoteProposal: ProposalRecordType | null
}): boolean => {
  // if proposal is locked we can't change anything in it
  return currentProposal?.locked
    ? true
    : proposalValidation?.bytesValidation
        // Filter empty bytes
        ?.filter(({ byteId }) => {
          const byte = currentProposal?.proposalData?.find(({ id }) => id === byteId)
          return byte && (byte.title || byte.encoded_code)
        })
        // Validate every byte that is non empty
        ?.every(({ validBytes, validTitle, validDescr, byteId }) => {
          const isRemoteByte = remoteProposal?.proposalData?.find(({ id }) => byteId === id)
          return isRemoteByte
            ? validBytes !== INPUT_STATUS_ERROR && validDescr !== INPUT_STATUS_ERROR
            : validBytes === INPUT_STATUS_SUCCESS &&
                validTitle === INPUT_STATUS_SUCCESS &&
                validDescr === INPUT_STATUS_SUCCESS
        }) ?? true
}

export const checkStage3Validation = ({
  proposalValidation,
  currentProposal,
  remoteProposal,
}: {
  proposalValidation: ProposalValidityObj | null
  currentProposal: ProposalRecordType | null
  remoteProposal: ProposalRecordType | null
}) => {
  // if proposal is locked we can't change anything in it
  return currentProposal?.locked
    ? true
    : proposalValidation?.paymentsValidation
        // Filter empty payments
        ?.filter(({ paymentId }) => {
          const payment = currentProposal?.proposalPayments?.find(({ id }) => id === paymentId)
          return payment && (payment.title || payment.to__id || payment.token_amount)
        })
        // Validate every paymnet that is non empty
        ?.every(({ to__id, title, token_amount, paymentId }) => {
          const isRemotePayment = remoteProposal?.proposalPayments?.find(({ id }) => paymentId === id)

          return isRemotePayment
            ? to__id !== INPUT_STATUS_ERROR && title !== INPUT_STATUS_ERROR && token_amount !== INPUT_STATUS_ERROR
            : to__id === INPUT_STATUS_SUCCESS && title === INPUT_STATUS_SUCCESS && token_amount === INPUT_STATUS_SUCCESS
        }) ?? true
}
