import { Component, type ErrorInfo, type ReactNode } from 'react'
import styled from 'styled-components'

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 24px;
`

const RetryButton = styled.button`
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

/**
 * Error boundary for lazy-loaded route chunks.
 * On chunk load failure, offers a retry button that reloads the page.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route chunk load error:', error, info)
  }

  handleRetry = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorWrapper>
          <h2>Something went wrong loading this page.</h2>
          <p>This may be due to a network issue or a new deployment.</p>
          <RetryButton onClick={this.handleRetry}>Reload Page</RetryButton>
        </ErrorWrapper>
      )
    }

    return this.props.children
  }
}
