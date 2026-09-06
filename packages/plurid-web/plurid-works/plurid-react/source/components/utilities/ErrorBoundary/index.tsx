// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface ErrorBoundaryProperties {
    renderError?: PluridReactComponent;
    children?: any;
}

export interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProperties) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(
        error: any,
    ) {
        return {
            hasError: true,
        };
    }

    componentDidCatch(
        error: any,
        errorInfo: any,
    ) {
    }

    render() {
        if (this.state.hasError) {
            if (this.props.renderError) {
                return this.props.renderError;
            }

            // A recovery state (U07, 2026-09-06): what failed, and a way to try again — on the look's tokens.
            return (
                <div
                    role="alert"
                    data-plurid-entity="PluridPlaneError"
                    style={{
                        padding: 'var(--plurid-margin, 16px)',
                        color: 'var(--plurid-plane-ink, inherit)',
                        fontFamily: 'var(--plurid-font, inherit)',
                        fontSize: 'var(--plurid-font-size, 13px)',
                    }}
                >
                    <p style={{ margin: '0 0 8px' }}>This plane could not render.</p>
                    <button
                        type="button"
                        data-plurid-control="plane-retry"
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            font: 'inherit',
                            padding: '6px 12px',
                            borderRadius: 'var(--plurid-radius, 9px)',
                            border: '1px solid var(--plurid-rim, currentColor)',
                            background: 'var(--plurid-surface, transparent)',
                            color: 'var(--plurid-ink, inherit)',
                            cursor: 'pointer',
                        }}
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
// #endregion module



// #region exports
export default ErrorBoundary;
// #endregion exports
