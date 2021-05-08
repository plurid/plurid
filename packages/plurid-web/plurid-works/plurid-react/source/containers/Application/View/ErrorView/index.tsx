// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region internal
    import {
        StyledErrorView,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridErrorViewProperties {
    error: string;
}

const PluridErrorView: React.FC<PluridErrorViewProperties> = (
    properties,
) => {
    const {
        error,
    } = properties;

    return (
        <StyledErrorView>
            {error}
        </StyledErrorView>
    );
}
// #endregion module



// #region exports
export default PluridErrorView;
// #endregion exports
