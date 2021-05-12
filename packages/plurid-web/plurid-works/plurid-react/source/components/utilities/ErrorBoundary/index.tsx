// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
export interface ErrorBoundaryProperties {
    renderError?: JSX.Element;
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

            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
// #endregion module



// #region exports
export default ErrorBoundary;
// #endregion exports
