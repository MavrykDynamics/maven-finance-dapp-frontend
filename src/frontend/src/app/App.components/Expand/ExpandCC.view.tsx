import { cloneElement, createContext, useContext, useState } from 'react'

type ExpandContextType = {
  isCollapsed: boolean
  collapseHandler: () => void
}

const ExpandContext = createContext<ExpandContextType | undefined>(undefined)

const Expand = ({ children }: any) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const collapseHandler = () => {
    setIsCollapsed(!isCollapsed)
  }

  const value = { isCollapsed, collapseHandler }

  return (
    <ExpandContext.Provider value={value}>
      <div className="card">{children}</div>
    </ExpandContext.Provider>
  )
}

const ExpandHeader = ({ children }: any) => {
  return <div>{children}</div>
}

const ExpandContent = ({ children }: any) => {
  const { isCollapsed } = useContext(ExpandContext) ?? {}

  if (!isCollapsed) return <></>
  return <div>{children}</div>
}

const Open = ({ children }: any) => {
  const { collapseHandler, isCollapsed } = useContext(ExpandContext) ?? {}

  if (isCollapsed) return <></>
  return <div onClick={collapseHandler}>{children}</div>
}

const Close = ({ children }: any) => {
  const { collapseHandler, isCollapsed } = useContext(ExpandContext) ?? {}

  if (!isCollapsed) return <></>
  return <div onClick={collapseHandler}>{children}</div>
}

Expand.Header = ExpandHeader
Expand.Content = ExpandContent
Expand.Open = Open
Expand.Close = Close

export default Expand
