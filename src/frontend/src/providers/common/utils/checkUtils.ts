export const isObjectChildrenNulls = (obj: Record<string, unknown>) => Object.values(obj).every((el) => el === null)
