// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridRouterContextValue {
    /** The router's matched path (pathname + search): the pathname belongs to the router. */
    path: string;
    /** Navigate the router to a path (dispatches the router's location-changed event). */
    navigate: (path: string) => void;
}

/**
 * Provided by `PluridRouterBrowser` around everything it renders: an application mounted inside a
 * router route reads it to learn that the pathname is the router's — its address-bar binding then
 * rides a query parameter (`docking.url`, 2026-09-06) instead of writing the path.
 */
const PluridRouterContext = React.createContext<PluridRouterContextValue | null>(null);
// #endregion module



// #region exports
export default PluridRouterContext;
// #endregion exports
