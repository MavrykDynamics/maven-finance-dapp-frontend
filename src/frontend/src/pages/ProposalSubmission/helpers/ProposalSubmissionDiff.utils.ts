import BigNumber from 'bignumber.js'

// consts
import { PaymentsDataChangesType, ProposalDataChangesType } from '../ProposalSubmission.types'

// helpers
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { arrConvertStringToNumber } from 'utils/array.utils'

// types
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'

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

// TODO: review it & add docs for it
export const getPaymentsDiff = (
  originalData: ProposalRecordType['proposalPayments'],
  updatedData: ProposalRecordType['proposalPayments'],
  tokensMetadata: TokensContext['tokensMetadata'],
): PaymentsDataChangesType => {
  let originalIdx = 0

  // convert token amount from string to number
  const _originalData = arrConvertStringToNumber(originalData, 'token_amount')
  const _updatedData = arrConvertStringToNumber(updatedData, 'token_amount')

  const changes = _updatedData
    .reduce<PaymentsDataChangesType>((acc, item1) => {
      const item2 = _originalData?.[originalIdx]

      const token1Metadata = getTokenDataByAddress({ tokensMetadata, tokenAddress: item1.token_address })

      if (!token1Metadata) return acc

      const { type, decimals } = token1Metadata

      let token = {}

      switch (type) {
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
        case 'mav':
        default:
          token = {
            mav: 'mav',
          }
          break
      }

      // if we have more items on client than on server, when we reach end of the items that stored on client array, just add everything to the end
      if (!item2 && typeof item1.token_amount === 'number') {
        acc.push({
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
        })
      }

      if (!checkPaymentExists(item1)) return acc

      // if local is different frin back one, we update this element
      if (
        item2 &&
        ((item2.title !== item1.title && item1.title !== null) ||
          (item2.to__id !== item1.to__id && item1.to__id !== null) ||
          (item2.token_address !== item1.token_address && item1.token_address !== null)) &&
        typeof item1.token_amount === 'number'
      ) {
        acc.push({
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
        })
      }
      originalIdx++

      return acc
    }, [])
    .concat(
      Array.from({ length: _originalData.length - _updatedData.length }, (_, idx) => ({
        removePaymentData: String(Number(_updatedData.length) + Number(idx)),
      })),
    )

  return changes
}
