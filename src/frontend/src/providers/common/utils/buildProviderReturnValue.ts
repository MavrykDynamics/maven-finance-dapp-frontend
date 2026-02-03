import { replaceNullValuesWithDefault } from './repalceNullValuesWithDefault'

/**
 * Builds the return value for a provider context hook.
 *
 * All providers follow the same pattern:
 * - If loading: return empty context defaults + common callbacks + isLoading: true
 * - If loaded: replace null values with defaults + common callbacks + isLoading: false
 *
 * @param ctxState - Current nullable state from the provider
 * @param emptyCtx - Default empty context (non-nullable)
 * @param commonToReturn - Callbacks and other values to always include
 * @param isLoading - Whether the provider is still loading data
 */
export const buildProviderReturnValue = <
  TState extends Record<string, unknown>,
  TCommon extends Record<string, unknown>,
>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctxState: any,
  emptyCtx: TState,
  commonToReturn: TCommon,
  isLoading: boolean,
): TState & TCommon & { isLoading: boolean } => {
  if (isLoading) {
    return {
      ...emptyCtx,
      ...commonToReturn,
      isLoading: true,
    }
  }

  const nonNullableProviderValue = replaceNullValuesWithDefault<TState>(ctxState, emptyCtx)

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}
