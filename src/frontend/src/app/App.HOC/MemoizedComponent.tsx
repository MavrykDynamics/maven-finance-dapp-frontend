import React from 'react'

type MemoizedComponentProps = {
  children: React.ReactElement<any, any> | null
  returnMemoizedComponent: boolean
}

export const MemoizedComponent = React.memo(
  ({ children }: MemoizedComponentProps) => {
    return children
  },
  (oldProps, newProps) => {
    if (newProps.returnMemoizedComponent) return true
    if (oldProps.returnMemoizedComponent === newProps.returnMemoizedComponent) return false
    return false
  },
)
