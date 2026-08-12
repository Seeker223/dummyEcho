import { Component } from 'react'
import styled from 'styled-components'

const ErrorShell = styled.section`
  margin: 24px auto;
  max-width: 680px;
  padding: 24px;
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
`

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Surface runtime failures without crashing the whole tree.
    console.error('Workflow UI error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorShell role="alert">
          <h2>Something failed in this screen.</h2>
          <p>Please refresh and try again.</p>
        </ErrorShell>
      )
    }
    return this.props.children
  }
}
