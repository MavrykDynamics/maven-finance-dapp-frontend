export const isObjectChildrenNulls = (obj?: Record<string, unknown> | null) =>
  Object.values(obj ?? {}).every((el) => el === null)
