// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridPlaneComponentProperty,
    } from '@plurid/plurid-data';
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


/** What `usePluridPlane()` knows about the plane: the `plurid` prop's `plane` object, as a context. */
export type PluridPlaneDetails = PluridPlaneComponentProperty['plane'];

/**
 * The plane's route identity (absolute route, parameters, query, fragments, parent), provided by
 * `PluridPlane` around its content with a value that changes only when the plane's identity does.
 */
export const PluridPlaneDetailsContext = React.createContext<PluridPlaneDetails | undefined>(undefined);
// #endregion module



// #region exports
export default PluridPlaneIDContext;
// #endregion exports
