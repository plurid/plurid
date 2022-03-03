// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region internal
    import {
        GlobalStyle,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const Shell = (
    properties,
) => {
    // #region properties
    const {
        children,
    } = properties;
    // #endregion properties


    // #region render
    return (
        <>
            <GlobalStyle />

            {children}
        </>
    );
    // #endregion render
}


const shell = Shell;
// #endregion module



// #region exports
export default shell;
// #endregion exports
