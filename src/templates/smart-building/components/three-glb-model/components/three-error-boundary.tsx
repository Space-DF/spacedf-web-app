import { Component } from 'react'

class ThreeModelErrorBoundary extends Component<
  {
    children: React.ReactNode
    fallback: React.ReactNode
    resetKey?: string | number
  },
  { hasError: boolean }
> {
  constructor(props: ThreeModelErrorBoundary['props']) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: ThreeModelErrorBoundary['props']) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export default ThreeModelErrorBoundary
