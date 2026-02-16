import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("UI Error Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f7',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1d1d1f' }}>Something went wrong.</h1>
                    <p style={{ marginBottom: '2rem', color: '#86868b' }}>We apologize for the inconvenience. Please try refreshing the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '100px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Refresh Page
                    </button>
                    <a href="/" style={{ marginTop: '16px', color: '#000', textDecoration: 'underline' }}>Go Home</a>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
