// #region imports
    // #region internal
    import {
        PluridRoute,
        PluridRoutePlane,
    } from './route';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridRouterProperties<C> {
    routes: PluridRoute<C>[];

    /**
     * Plurid planes not specific to any route.
     */
    planes?: PluridRoutePlane<C>[];

    /**
     * Component to be rendered outside of the current `path` component and of the `shell`.
     */
    // exterior?: PluridComponent;
    exterior?: C;

    /**
     * Component to wrap around the current path component.
     */
    // shell?: PluridComponent;
    shell?: C;

    /**
     * Path to navigate to when using clean navigation.
     */
    view?: string;

    /**
     * Navigate without changing the browser URL.
     */
    cleanNavigation?: boolean;

    /**
     * Development default: 'http'.
     * Production default: 'https'.
     */
    protocol?: string;

    /**
     * Default: `'origin'` | `window.location.host`.
     */
    hostname?: string;

    /**
     * The `gatewayPath` is used to receive external routing requests.
     *
     * e.g.
     *
     * `https://example.com/gateway?plurid=https://subdomain.example.com://path/to/123://s://u://c://a-plane`
     *
     * will route to that specific
     *
     * `host://path://space://universe://cluster://plane`
     */
    gatewayPath?: string;

    /**
     * Component to be rendered on the gateway path, external to the plurid view.
     */
    // gatewayExterior?: PluridComponent;
    gatewayExterior?: C;

    /**
     * Redirect not found paths to this path.
     * Default: `/not-found`.
     */
    notFoundPath?: string;

    /**
     * API endpoint to request the elements for the paths not found in the initial routing.
     */
    api?: string;

    static?: PluridRouterStatic;

    /**
     * Replace the internal plurid plane with a custom implementation.
     */
    customPlane?: C;

    /**
     * After router navigation scroll to the top.
     *
     * Default: `smooth`.
     */
    scrollToTop?: boolean | 'instant' | 'smooth';
}


export interface PluridRouterStatic {
    path: string;
    directPlane?: string;
}
// #endregion module



// #region exports
export * from './fragment';
export * from './multispace';
export * from './preserve';
export * from './route';
// #endregion exports
