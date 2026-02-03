import styled from 'styled-components'

const FallbackWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  width: 100%;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

/**
 * Lightweight loading fallback for React.lazy() Suspense boundaries.
 * Intentionally avoids context dependencies so it works outside providers.
 */
export const RouteLoadingFallback = () => (
  <FallbackWrapper>
    <Spinner />
  </FallbackWrapper>
)
