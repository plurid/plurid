// #region imports
    // #region external
    import {
        PluridComponent,
    } from '../component';

    import {
        PluridPartialConfiguration,
    } from '../configuration';

    import {
        CompareType,
    } from '../compare';
    // #endregion external
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
     * Development default: `'localhost:3000'`.
     *
     * Production default: `window.location.host`.
     */
    host?: string;

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
}


export interface PluridRouterStatic {
    path: string;
    directPlane?: string;
}


/**
 * A route can be `plurid space` or `exterior`-based.
 */
export interface PluridRoute<C> {
    /**
     * The route `value` can:
     * + be a simple string, e.g. `'/route/to/page'`;
     * + be a parametric location, e.g. `'/route/to/:page'`, where `:page` is the parameter name;
     * + receive query `key=value` pairs,
     * e.g. `'/route/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs;
     */
    value: string;

    parameters?: Record<string, PluridRouteParameter>;

    /**
     * Accepts a component which will be rendered outside of the `spaces`.
     */
    // exterior?: PluridComponent;
    exterior?: C;

    /**
     * A path can have planes and/or spaces.
     *
     * Planes will be assigned to the `default` space, `default` universe, `default` cluster.
     */
    planes?: PluridRoutePlane<C>[];

    view?: string[];

    /**
     * A path can have planes and/or spaces.
     */
    spaces?: PluridRouteSpace<C>[];

    /**
     * Pass the rendered `spaces[]` components as a property to the `exterior` component
     * to be rendered in particular slots.
     */
    slotted?: boolean;

    multispace?: PluridRouteMultispace<C>;

    defaultConfiguration?: PluridPartialConfiguration;
}


export interface PluridPreserve<C = undefined> {
    /**
     * Served path value.
     */
    serve: string;

    /**
     * The function will be executed and awaited before rendering the application on the server.
     *
     * The function can return one or more providers which will be passed to their appropriate consumers,
     * can redirect to a different path, or can handle any cross-cutting concerns, such as eventing or logging.
     */
    onServe: PluridPreserveOnServe<C>;

    /**
     * Function called after route is served successfully.
     */
    afterServe?: PluridPreserveAfterServe<C>;

    /**
     * Function called if `onServe` throws an error.
     */
    onError?: PluridPreserveOnError<C>;
}


export type PluridPreserveOnServe<C> = (
    transmission: PluridPreserveTransmission<C | undefined>,
) => Promise<PluridPreserveResponse | void>;


export type PluridPreserveAfterServe<C> = (
    transmission: PluridPreserveTransmission<C | undefined>,
) => Promise<void>;


export type PluridPreserveOnError<C> = (
    error: any,
    transmission: PluridPreserveTransmission<C | undefined>,
) => Promise<PluridPreserveResponse | void>;


export interface PluridPreserveTransmission<C = undefined> {
    request: any;
    response: any;
    context: PluridPreserveTransmissionContext<C>;
}

export interface PluridPreserveTransmissionContext<C = undefined> {
    path: string;
    /** URL Router `MatchedRoute` */
    match: {
        target: string;
        source: string;
        elements: any;
        parameters?: Record<string, string>;
    };
    contextualizers: C;
}


export interface PluridPreserveResponse {
    providers?: PluridPreserveResponseProviders;

    /**
     * Redirect to another route.
     */
    redirect?: string;

    /**
     * If `response` is handled within the preserve `action`, set the `responded` value to `true`,
     * to prevent the server from sending a double response.
     */
    responded?: boolean;

    /**
     * Handle the server response without taking into account the preserve.
     * Considers only the first match.
     */
    depreserve?: boolean;

    /**
     * Ignore the preserve computation, but continue to try to find a match in the preserves array.
     * To be used with the catch-all matcher `'*'` or with complex routing with overlapping parameters.
     */
    pass?: boolean;

    /**
     * Key-value pairs which will be inserted as globals on the window as in
     * `window.${key} = ${value}`.
     */
    globals?: Record<string, string>;
}

export interface PluridPreserveResponseProviders {
    apollo?: any;
    redux?: any;
    plurid?: any;
}


export interface PluridRouteParameter {
    /**
     * Constrain the path parameter to be of a certain length.
     */
    length?: number;

    /**
     * Ensure that the `length` of the path is of a certain type:
     *
     * * `'=='`     - equal,
     * * `'<='`     - equal or less than,
     * * `'<'`      - less than,
     * * `'>='`     - equal or greater than,
     * * `'>'`      - greater than.
     *
     * Default `'<='`, if a `length` is provided.
     */
    lengthType?: CompareType;

    startsWith?: string;
    endsWith?: string;

    includes?: string[];
}


export interface PluridRouteSpace<C> {
    value: string;

    /**
     * Accepts a component which will be rendered outside of the `space`.
     */
    // exterior?: PluridComponent;
    exterior?: C;

    /**
     * A space can have planes and/or universes.
     *
     * Planes will be assigned to the `default` universe, `default` cluster.
     */
    planes?: PluridRoutePlane<C>[];

    view?: string[];

    /**
     * A space can have planes and/or universes.
     */
    universes?: PluridRouteUniverse<C>[];

    configuration?: PluridPartialConfiguration;
}


export interface PluridRouteUniverse<C> {
    value: string;

    /**
     * An universe can have planes and/or clusters.
     *
     * Planes will be assigned to the `default` cluster.
     */
    planes?: PluridRoutePlane<C>[];

    clusters?: PluridRouteCluster<C>[];
}


export interface PluridRouteCluster<C> {
    value: string;
    planes: PluridRoutePlane<C>[];
}


export interface PluridRoutePlaneOptions {
    /**
     * Map a direct link for a specific plane.
     *
     * e.g. `/plane-one` will route in browser the path `protocol://host/plane-one`
     *
     * Default composed from route and plane value, `/<route.value/<plane.value>`
     */
    link?: string;

    /**
     * On direct link access (from the browser), show the plane in a `plurid` space,
     * or as the legacy view of an web page.
     *
     * Default `'plurid'`
     */
    linkView?: 'legacy' | 'plurid';

    /**
     * Injectable into other `plurid` spaces.
     *
     * Default `true`
     */
    injectable?: boolean;

    /**
     * Direct access to the plane from the browser.
     *
     * Default plane link composed from route and plane value, `/<route.value/<plane.value>`;
     * changeable through the `link` property.
     *
     * Default `true`
     */
    urlable?: boolean;

    /**
     * Access to the plane through the `gateway` path.
     *
     * Default `true`
     */
    gateable?: boolean;

    /**
     * Render route exterior when directly accessed.
     *
     * Default `true`
     */
    directExterior?: boolean;

    /**
     * Render route exterior when injected into other `plurid` space.
     *
     * Default `false`
     */
    injectExterior?: boolean;

    /**
     * Constraints for the parameters.
     */
    parameters?: Record<string, PluridRouteParameter>;
}

export interface PluridRoutePlaneObject<C> extends PluridRoutePlaneOptions {
    value: string;
    component: C;
}

export type PluridRoutePlaneTuple<C> = [
    /**
     * See `PluridRoutePlaneObject<C>.value`.
     */
    value: string,

    /**
     * See `PluridRoutePlaneObject<C>.component`.
     */
    component: C,

    options?: PluridRoutePlaneOptions,
];

export type PluridRoutePlane<C> =
    | PluridRoutePlaneObject<C>
    | PluridRoutePlaneTuple<C>;



export interface PluridRouteMultispace<C> {
    /**
     * Default: `y`.
     */
    alignment?: 'x' | 'y';

    /**
     * Default: `mandatory`.
     */
    snapType?: 'none' | 'mandatory' | 'proximity';

    header?: C;
    footer?: C;
    // header?: PluridComponent;
    // footer?: PluridComponent;
}



export interface PluridRouteFragments {
    texts: PluridRouteFragmentText[];
    elements: PluridRouteFragmentElement[];
}

export interface PluridRouteFragment {
    type: string;
}

export interface PluridRouteFragmentText extends PluridRouteFragment {
    type: 'text';
    start: string;
    end: string;
    occurence: number;
}

export interface PluridRouteFragmentElement extends PluridRouteFragment {
    type: 'element';
    id: string;
    occurence: number;
}
// #endregion module
