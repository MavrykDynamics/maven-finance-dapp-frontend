import BigNumber from 'bignumber.js'

import {
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  defaultProposalMetadataTitleMaxLength,
} from 'app/App.components/Input/Input.constants'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'
import { ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import {
  PaymentsDataChangesType,
  ProposalDataChangesType,
  ProposalValidityObj,
  StageThreeValidityItem,
} from './ProposalSubmission.types'
import { State } from 'reducers'

// helpers
import { validateTzAddress, isValidLength } from 'utils/validatorFunctions'
import { convertNumberForContractCall } from 'utils/calcFunctions'

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

export const checkBytesPairExists = (proposalDataItem: ProposalRecordType['proposalData'][number]): boolean => {
  return proposalDataItem.title !== null && proposalDataItem.encoded_code !== null
}

export const checkPaymentExists = (proposalPaymentMethod: ProposalRecordType['proposalPayments'][number]): boolean => {
  return (
    proposalPaymentMethod.title !== null &&
    proposalPaymentMethod.to__id !== null &&
    proposalPaymentMethod.to__id !== null
  )
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

// GET DIFFS FOR SAVE CHANGES
export const getBytesDiff = (
  originalData: ProposalRecordType['proposalData'],
  updatedData: ProposalRecordType['proposalData'],
): ProposalDataChangesType => {
  let originalIdx = 0
  const changes = updatedData
    .map<ProposalDataChangesType[number] | null>((item1) => {
      const item2 = originalData?.[originalIdx]
      // if we have more items on client than on server, when we reach end of the items that stored on client array, just add everything to the end
      if (!item2) {
        return {
          addOrSetProposalData: {
            title: item1.title ?? '',
            encodedCode: item1.encoded_code ?? '',
            codeDescription: item1.code_description ?? '',
          },
        }
      }

      if (!checkBytesPairExists(item1)) {
        return null
      }

      if (
        (item2.title !== item1.title && item1.title !== null) ||
        ((item2.encoded_code !== item1.encoded_code || item2.code_description !== item1.code_description) &&
          item1.title !== null)
      ) {
        return {
          addOrSetProposalData: {
            title: item1.title ?? '',
            encodedCode: item1.encoded_code ?? '',
            codeDescription: item1.code_description ?? '',
            index: String(originalIdx++),
          },
        }
      }

      originalIdx++
      return null
    })
    .concat(
      Array.from({ length: originalData.length - updatedData.length }, (_, idx) => ({
        removeProposalData: String(Number(updatedData.length) + Number(idx)),
      })),
    )
    .filter(Boolean) as ProposalDataChangesType

  return changes
}

export const getPaymentsDiff = (
  originalData: ProposalRecordType['proposalPayments'],
  updatedData: ProposalRecordType['proposalPayments'],
  paymentMethods: Array<{ symbol: string; address: string; shortSymbol: string; id: number }>,
  dipDupTokens: State['tokens']['dipDupTokens'],
): PaymentsDataChangesType => {
  let originalIdx = 0

  const changes = updatedData
    .map<PaymentsDataChangesType[number] | null>((item1) => {
      const item2 = originalData?.[originalIdx]

      // default decimals is 6 cuz 6 is xtz decimals, and dipDupTokens don't contain xtz asset
      const decimals =
        item1.token_address === 'XTZ'
          ? 6
          : dipDupTokens.find(({ contract }) => contract === item1.token_address)?.metadata?.decimals ?? 0

      const symbol =
        item1.token_address === 'XTZ'
          ? 'tez'
          : paymentMethods.find(({ address }) => address === item1.token_address)?.shortSymbol ?? 'fa2'

      let token = {}

      switch (symbol.toLowerCase()) {
        case 'fa12':
          token = {
            fa12: item1.token_address,
          }
          break
        case 'fa2':
          token = {
            fa2: {
              tokenContractAddress: item1.token_address,
              tokenId: item1.token_id ?? 0,
            },
          }
          break
        case 'tez':
        default:
          token = {
            tez: 'tez',
          }
          break
      }

      // if we have more items on client than on server, when we reach end of the items that stored on client array, just add everything to the end
      if (!item2) {
        return {
          addOrSetPaymentData: {
            title: item1.title ?? '',
            transaction: {
              to_: item1.to__id ?? '',
              token,
              amount: new BigNumber(
                convertNumberForContractCall({ number: item1.token_amount, grade: Number(decimals) }),
              ),
            },
          },
        }
      }

      if (!checkPaymentExists(item1)) {
        return null
      }

      // if local is different frin back one, we update this element
      if (
        (item2.title !== item1.title && item1.title !== null) ||
        (item2.to__id !== item1.to__id && item1.to__id !== null) ||
        (item2.token_address !== item1.token_address && item1.token_address !== null)
      ) {
        return {
          addOrSetPaymentData: {
            title: item1.title ?? '',
            transaction: {
              to_: item1.to__id ?? '',
              token,
              amount: new BigNumber(
                convertNumberForContractCall({ number: item1.token_amount, grade: Number(decimals) }),
              ),
            },
            index: String(originalIdx++),
          },
        }
      }
      originalIdx++
      return null
    })
    .concat(
      Array.from({ length: originalData.length - updatedData.length }, (_, idx) => ({
        removePaymentData: String(Number(updatedData.length) + Number(idx)),
      })),
    )
    .filter(Boolean) as PaymentsDataChangesType

  return changes
}

// CONSTS

export const PROPOSAL_BYTE = {
  encoded_code: '',
  id: 1,
  internal_id: 0,
  title: '',
  code_description: '',
  order: 1,
  isUnderTheDrop: false,
  isLocalBytes: true,
  governance_proposal: {} as Governance_Proposal,
  governance_proposal_id: 0,
}

export const DEFAULT_PROPOSAL: ProposalRecordType = {
  id: -1,
  proposerId: '',
  governanceId: '',
  status: ProposalStatus.UNLOCKED,
  title: '',
  description: '',
  invoice: '',
  sourceCode: '',
  passVoteMvkTotal: 0,
  upvoteMvkTotal: 0,
  downvoteMvkTotal: 0,
  abstainMvkTotal: 0,
  minQuorumPercentage: 0,
  quorumMvkTotal: 0,
  currentCycleEndLevel: 0,
  cycle: 0,
  successReward: 0,
  proposalData: [],
  votes: [],
  proposalPayments: [],
  currentRoundProposal: true,
  paymentProcessed: false,
  anyCanExecute: false,
  anyCanPay: false,
  executed: false,
  locked: false,
}

export const DEFAULT_PROPOSAL_VALIDATION: ProposalValidityObj = {
  title: '',
  description: '',
  invoice: '',
  successMVKReward: '',
  invoiceTable: '',
  sourceCode: '',
  bytesValidation: [],
  paymentsValidation: [],
}
