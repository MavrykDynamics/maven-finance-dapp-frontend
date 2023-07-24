export const replaceNullValuesWithDefault = <T extends Record<string, unknown>>(
  providerValues: T,
  emptyProviderValues: DeepNonNullable<T>,
  keysToKeepOriginal?: Array<keyof T>,
) => {
  return Object.fromEntries(
    Object.entries(providerValues).map(([key, value]) => {
      const emptyValue = emptyProviderValues[key]

      if (value === null && !keysToKeepOriginal?.includes(key)) return [key, emptyValue]
      return [key, value]
    }),
  ) as DeepNonNullable<T>
}
