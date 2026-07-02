// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Identifies the plane a content component is rendered inside. Provided by
 * `PluridRoot` at the plane-content injection sites with a STATIC value per
 * plane instance (zero re-render cost); `undefined` outside plane content
 * (route exterior, shell, overlays).
 */
const PluridPlaneIDContext = React.createContext<string | undefined>(undefined);
// #endregion module



// #region exports
export default PluridPlaneIDContext;
// #endregion exports
