// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridApi,
        PluridPubSub,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridRouterContextValue {
    /** The router's matched location, pathname + search (the request's on the server, the window's in the browser): the pathname belongs to the router. */
    path: string;
    /** Navigate the router to a path (dispatches the router's location-changed event). */
    navigate: (path: string) => void;
    /** THE READINESS CONTRACT in the route-driven mode: the application rendered for the matched route fires it. A stable function, whatever the host passes. */
    onReady: (api: PluridApi) => void;
    /** The router's bus, shared by every route's application. */
    pubsub?: PluridPubSub;
}

/** A matched path split the way `window.location` is: the pathname and the query (`''` for none). */
export const locationOf = (
    path: string,
): { pathname: string; search: string } => {
    const query = path.indexOf('?');
    return query === -1
        ? { pathname: path, search: '' }
        : { pathname: path.slice(0, query), search: path.slice(query) };
};

/**
 * Provided by `PluridRouterBrowser` around everything it renders: an application mounted inside a
 * router route reads it to learn that the pathname is the router's — its address-bar binding then
 * rides a query parameter (`docking.url`) instead of writing the path — and to take the router's
 * `onReady` and bus.
 */
const PluridRouterContext = React.createContext<PluridRouterContextValue | null>(null);
// #endregion module



// #region exports
export default PluridRouterContext;
// #endregion exports
