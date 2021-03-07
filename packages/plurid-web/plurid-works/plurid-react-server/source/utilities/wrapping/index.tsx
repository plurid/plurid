// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
const wrapping = (
    WrappedComponent: any,
    WrappeeComponent: any,
    properties: any,
) => {
    return class extends React.Component {
        constructor(props: any) {
            super(props);
        }

        render() {
            return (
                <WrappedComponent
                    {...properties}
                >
                    <WrappeeComponent />
                </WrappedComponent>
            )
        }
    }
}
// #endregion module



// #region exports
export default wrapping;
// #endregion exports
