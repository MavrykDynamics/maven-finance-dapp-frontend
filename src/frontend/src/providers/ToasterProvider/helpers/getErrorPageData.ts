import {
  ErrorPageFatal,
  ErrorPageRouter,
  errorDescDefaultText,
  errorDescDefaultTextWhenError,
  errorHeaderDefaultText,
  errorHeaderDefaultTextWhenError,
} from '../toaster.provider.const'
import { ErrorPageType } from '../toaster.provider.type'

export function getErrorPageData(type: ErrorPageType | null) {
  switch (type) {
    case ErrorPageRouter:
      return {
        header: errorHeaderDefaultText,
        desc: errorDescDefaultText,
      }
    case ErrorPageFatal:
      return {
        header: errorHeaderDefaultTextWhenError,
        desc: errorDescDefaultTextWhenError,
      }
    default:
      return {
        header: errorHeaderDefaultText,
        desc: errorDescDefaultText,
      }
  }
}
