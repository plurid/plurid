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
/** What a host's own error component is given. */
export interface PluridPlaneErrorProperties {
    /** what the plane threw */
    error: unknown;
    /** render the plane again */
    retry: () => void;
}

export interface ErrorBoundaryProperties {
    renderError?: PluridReactComponent;
    /** told what was caught, once per error */
    onError?: (error: unknown) => void;
    children?: any;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error?: unknown;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProperties) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(
        error: unknown,
    ) {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(
        error: unknown,
    ) {
        // the host hears of it (`space.changed` kind `planeError`); React reports it too
        try {
            this.props.onError?.(error);
        } catch (_) {
            // a reporter that throws must not take the boundary down with it
        }
    }

    private retry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // A HOST'S OWN ERROR COMPONENT, RENDERED: the boundary used to return the component
            // function itself, which React refuses as a child, so the host's fallback never showed.
            // A registered-name string (an ElementQL component) is not a React component: the
            // built-in card stands in for it.
            const RenderError = this.props.renderError;
            if (RenderError && typeof RenderError !== 'string') {
                const Component = RenderError as React.ComponentType<PluridPlaneErrorProperties>;
                return (
                    <Component
                        error={this.state.error}
                        retry={this.retry}
                    />
                );
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
                        onClick={this.retry}
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
