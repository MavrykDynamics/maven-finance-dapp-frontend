export const mergeFilters = <T, V, G extends string>(
  filterGetter: () => { where: T; orderBy: V },
  filters: Record<G, { where: Partial<T>; orderBy: Partial<V> }>,
  key: G,
) => {
  const { where: originalWhere, orderBy: originalOrderBy } = filterGetter()
  const { where: filteredWhere = {}, orderBy: filteredOrderBy = {} } = filters[key] ?? {}

  return {
    where: { ...originalWhere, ...filteredWhere },
    orderBy: { ...originalOrderBy, ...filteredOrderBy },
  }
}
