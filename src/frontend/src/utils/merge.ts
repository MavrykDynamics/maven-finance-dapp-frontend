export const mergeFilters = <T, V, G extends string>(
  filterGetter: () => { where: T; orderBy: V; shadowWhere?: any },
  filters: Record<G, { where: Partial<T>; orderBy: Partial<V>; shadowWhere?: any }>,
  key: G,
) => {
  const { where: originalWhere, orderBy: originalOrderBy, shadowWhere } = filterGetter()
  const {
    where: filteredWhere = {},
    orderBy: filteredOrderBy = {},
    shadowWhere: filteredShadowWhere = {},
  } = filters[key] ?? {}

  return {
    where: { ...originalWhere, ...filteredWhere },
    orderBy: { ...originalOrderBy, ...filteredOrderBy },
    shadowWhere: { ...shadowWhere, ...filteredShadowWhere },
  }
}
