// #region imports
    // #region external
    import {
        PluridRouteParameter,
    } from '../router';
    // #endregion external
// #endregion imports



// #region module
export interface PluridPlaneOptions {
    /**
     * Constraints for the parameters.
     */
    parameters?: Record<string, PluridRouteParameter>;
}


export interface PluridPlaneObject<C> extends PluridPlaneOptions {
    /**
     * Route to the plane, e.g. `/plane-1`. By convention, it starts with an '/'.
     *
     * The `route` can be
     * + unassigned,
     * + assigned,
     * + absolute.
     *
     * The unassigned route respects the format
     * `/plane` and will be automatically assigned
     * to the `default` space, `default` universe, `default` cluster.
     *
     * The assigned path respects the format
     * `/path://space://universe://cluster://plane`
     * and it presupposes the given `protocol` and `host`.
     *
     * The absolute path respects the format
     * `protocol://host://path://space://universe://cluster://plane`
     * and is useful for cross-origins requests.
     *
     * The route can have parameters, e.g. `/plane/:id`.
     *
     * The parameter, in the example `id`,
     * will be passed in the property `plurid.parameters` to the component,
     * e.g. `componentProperties.plurid.route.plane.parameters.id`.
     *
     */
    route: string;

    /**
     * Component to be rendered in the PluridPlane.
     */
    component: C;


    // /**
    //  * Optional, application or document-wide unique identifier (if multiple documents).
    //  *
    //  * If provided to one plane, all the planes must have IDs.
    //  *
    //  * Once provided, the planes can have similar paths,
    //  * but the `PluridLink`s should be ID-based to ensure correct linking.
    //  */
    // id?: string;

    // /**
    //  * Optional, application or document-wide unique identifier (if multiple documents).
    //  *
    //  * A cluster will ensure that all the planes it contains will be rendered together.
    //  */
    // cluster?: string;
}

export type PluridPlaneTuple<C> = [
    /**
     * See `PluridPlaneObject<C>.route`.
     */
    route: string,

    /**
     * See `PluridPlaneObject<C>.component`.
     */
    component: C,

    /**
     * See `PluridPlaneOptions`.
     */
    options?: PluridPlaneOptions,
];

export type PluridPlane<C> =
    | PluridPlaneObject<C>
    | PluridPlaneTuple<C>;


export type PluridPlaneContext<T> = React.Context<T>;


export interface IndexedPluridPlane<C> {
    protocol: string;
    host: string;
    path: string;
    space: string;
    universe: string;
    cluster: string;
    plane: string;
    route: string;
    component: C;
}


export interface RouteSegment {
    [key: string]: any;
}


export interface RegisteredPluridPlane<C> {
    route: {
        // protocol: RouteSegment;
        // host: RouteSegment;
        // path: RouteSegment;
        // space: RouteSegment;
        // universe: RouteSegment;
        // cluster: RouteSegment;
        // plane: RouteSegment;
        absolute: string;
    };
    component: C;
}
// #endregion module
