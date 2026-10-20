import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.08)',
          textAlign: 'center',
          margin: '1.5rem 0'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            margin: '0 auto 1rem'
          }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>
            {this.props.fallbackTitle || 'Unable to Load Module'}
          </h3>
          <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.85rem', maxWidth: '500px', marginInline: 'auto' }}>
            {this.state.error?.message || 'A temporary display issue occurred while rendering this module.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fas fa-redo-alt"></i> Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
