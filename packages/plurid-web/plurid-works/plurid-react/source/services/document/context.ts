// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region internal
    import {
        PluridDocumentRegistry,
    } from './registry';
    // #endregion internal
// #endregion imports



// #region module
/** The document registry of the enclosing scope (`PluridDocumentScope`); `null` outside one. */
const PluridDocumentRegistryContext = React.createContext<PluridDocumentRegistry | null>(null);
// #endregion module



// #region exports
export default PluridDocumentRegistryContext;
// #endregion exports
