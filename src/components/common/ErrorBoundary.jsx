import { Component } from 'react';

/**
 * Global Error Boundary — catches render errors and prevents full app crash.
 * Fixes audit issue U-13.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Only log in development — don't expose internals in production console
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--danger, #F4212E)">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                        <h2>Something went wrong</h2>
                        <p>An unexpected error occurred. Please try again.</p>
                        <button
                            onClick={this.handleReset}
                            style={{
                                marginTop: '16px',
                                padding: '10px 24px',
                                background: 'var(--twitter-blue, #1DA1F2)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: 700
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
